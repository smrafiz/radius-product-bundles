"use server";

import {
    GetMainThemeDocument,
    GetThemeFilesDocument,
    type GetMainThemeQuery,
    type GetThemeFilesQuery,
} from "@/lib/graphql/generated/graphql";
import type { ApiResponse } from "@/shared";
import { executeGraphQLQuery } from "@/lib";
import { handleSessionToken } from "@/lib/shopify";
import type { WidgetStatus } from "@/features/dashboard";
import { unstable_cache } from "next/cache";
import { cacheTags, cacheDurations, invalidateWidgetBlockCache } from "@/lib/cache";

const APP_SLUGS = [
    "product-bundles",
    "product-bundles47",
    "product-bundle-widget",
    "radius-bundles",
    "radius-product-bundles",
];
const BLOCK_HANDLE = "app-block";
const EMBED_HANDLE = "app-embed";

type ThemeFileNode = NonNullable<
    GetThemeFilesQuery["theme"]
>["files"] extends { nodes: (infer N)[] } | null | undefined
    ? N
    : never;

function getFileContent(body: ThemeFileNode["body"]): string | undefined {
    if (body && "content" in body) {
        return body.content;
    }
    return undefined;
}

function hasWidgetBlockInContent(content: string | undefined): boolean {
    if (!content) return false;
    const normalized = content.replaceAll("\\/", "/");
    return APP_SLUGS.some((slug) =>
        normalized.includes(`shopify://apps/${slug}/blocks/${BLOCK_HANDLE}`),
    );
}

function hasAppEmbedInSettings(content: string | undefined): boolean {
    if (!content) return false;
    try {
        const settings = JSON.parse(content);
        const current = settings?.current;
        if (!current) return false;
        const blocks: Record<string, { type?: string; disabled?: boolean }> =
            current.blocks ?? {};
        return Object.values(blocks).some((block) => {
            if (block.disabled) return false;
            const type = block.type ?? "";
            return APP_SLUGS.some((slug) =>
                type.includes(`shopify://apps/${slug}/blocks/${EMBED_HANDLE}`),
            );
        });
    } catch {
        return false;
    }
}

async function scanAllJsonTemplates(
    shop: string,
    accessToken: string,
    themeId: string,
    themeName: string,
    alreadyChecked: string[],
): Promise<{ found: boolean; filesWithWidget: string[] }> {
    const additionalTemplates = [
        "templates/article.json",
        "templates/blog.json",
        "templates/cart.json",
        "templates/search.json",
        "templates/list-collections.json",
        "templates/404.json",
        "templates/password.json",
        "templates/gift_card.json",
    ];

    const toCheck = additionalTemplates.filter(
        (f) => !alreadyChecked.includes(f),
    );

    if (toCheck.length === 0) return { found: false, filesWithWidget: [] };

    const result = await executeGraphQLQuery<GetThemeFilesQuery>({
        query: GetThemeFilesDocument,
        variables: { themeId, filenames: toCheck },
        shop,
        accessToken,
    });

    const files = result.data?.theme?.files?.nodes ?? [];

    for (const file of files) {
        const content = getFileContent(file.body);
        if (hasWidgetBlockInContent(content)) {
            return {
                found: true,
                filesWithWidget: [`${themeName}:${file.filename}`],
            };
        }
    }

    return { found: false, filesWithWidget: [] };
}

/**
 * Core scanner — makes 2-3 Shopify Admin API calls.
 * Not exported. Callers use the cached wrappers below.
 */
async function fetchWidgetBlockStatus(
    shop: string,
    accessToken: string,
): Promise<WidgetStatus> {
    const themesResult = await executeGraphQLQuery<GetMainThemeQuery>({
        query: GetMainThemeDocument,
        shop,
        accessToken,
    });

    const mainTheme = themesResult.data?.themes?.nodes?.[0];

    if (!mainTheme) {
        return {
            hasWidgetBlock: false,
            hasAppEmbed: false,
            isFullyIntegrated: false,
            checkedTemplates: [],
            checkedSections: [],
            detectedInTheme: null,
        };
    }

    const templateFiles = [
        "templates/product.json",
        "templates/index.json",
        "templates/page.json",
        "templates/collection.json",
        "config/settings_data.json",
    ];

    const filesResult = await executeGraphQLQuery<GetThemeFilesQuery>({
        query: GetThemeFilesDocument,
        variables: { themeId: mainTheme.id, filenames: templateFiles },
        shop,
        accessToken,
    });

    const files = filesResult.data?.theme?.files?.nodes ?? [];

    let hasWidgetBlock = false;
    let hasAppEmbed = false;
    const checkedTemplates: string[] = [];

    for (const file of files) {
        const content = getFileContent(file.body);

        if (file.filename === "config/settings_data.json") {
            if (hasAppEmbedInSettings(content)) hasAppEmbed = true;
            continue;
        }

        checkedTemplates.push(`${mainTheme.name}:${file.filename}`);
        if (!hasWidgetBlock && hasWidgetBlockInContent(content)) {
            hasWidgetBlock = true;
        }
    }

    if (!hasWidgetBlock) {
        const scanResult = await scanAllJsonTemplates(
            shop,
            accessToken,
            mainTheme.id,
            mainTheme.name,
            templateFiles,
        );
        if (scanResult.found) {
            hasWidgetBlock = true;
            checkedTemplates.push(...scanResult.filesWithWidget);
        }
    }

    return {
        hasWidgetBlock,
        hasAppEmbed,
        isFullyIntegrated: hasWidgetBlock,
        checkedTemplates,
        checkedSections: [],
        detectedInTheme: hasWidgetBlock ? mainTheme.name : null,
    };
}

/**
 * Returns cached widget block status for a shop.
 * TTL: 5 minutes. Busted by recheckWidgetBlockStatusAction (the "Verify" button).
 *
 * unstable_cache requires a serializable factory — accessToken is passed in
 * so that cached results are still scoped to the correct shop credentials,
 * but the cache key only uses shop (accessTokens rotate and would cause
 * unnecessary cache misses if included in the key).
 */
function getCachedWidgetStatus(shop: string, accessToken: string) {
    return unstable_cache(
        () => fetchWidgetBlockStatus(shop, accessToken),
        ["widget-block-status", shop],
        {
            tags: [cacheTags.widgetBlockStatus(shop)],
            revalidate: cacheDurations.widgetBlockStatus,
        },
    )();
}

/**
 * Check widget block status — served from cache when available (5 min TTL).
 * Called automatically on dashboard mount. Fast on repeat visits.
 */
export async function checkWidgetBlockStatusAction(
    sessionToken: string,
): Promise<ApiResponse<WidgetStatus>> {
    try {
        const { session, shop } = await handleSessionToken(sessionToken);

        if (!session?.accessToken) {
            return { status: "error", message: "No access token" };
        }

        const data = await getCachedWidgetStatus(shop, session.accessToken);

        return { status: "success", data };
    } catch (err) {
        console.error("[checkWidgetBlockStatus] Error:", err);
        return {
            status: "error",
            message: "Failed to check widget block status",
        };
    }
}

/**
 * Force-recheck widget block status, bypassing the cache.
 * Call this from the "Verify" button in the setup guide so the user
 * gets a live result rather than a potentially stale cached one.
 */
export async function recheckWidgetBlockStatusAction(
    sessionToken: string,
): Promise<ApiResponse<WidgetStatus>> {
    try {
        const { session, shop } = await handleSessionToken(sessionToken);

        if (!session?.accessToken) {
            return { status: "error", message: "No access token" };
        }

        // Bust the cache first so getCachedWidgetStatus runs fresh
        invalidateWidgetBlockCache(shop);

        const data = await getCachedWidgetStatus(shop, session.accessToken);

        return { status: "success", data };
    } catch (err) {
        console.error("[recheckWidgetBlockStatus] Error:", err);
        return {
            status: "error",
            message: "Failed to recheck widget block status",
        };
    }
}
