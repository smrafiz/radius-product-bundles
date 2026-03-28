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

/**
 * Extracts text content from a theme file body union type.
 */
function getFileContent(body: ThemeFileNode["body"]): string | undefined {
    if (body && "content" in body) {
        return body.content;
    }

    return undefined;
}

/**
 * Checks if a JSON template contains a widget block reference.
 */
function hasWidgetBlockInContent(content: string | undefined): boolean {
    if (!content) {
        return false;
    }

    const normalized = content.replaceAll("\\/", "/");
    return APP_SLUGS.some((slug) =>
        normalized.includes(`shopify://apps/${slug}/blocks/${BLOCK_HANDLE}`),
    );
}

/**
 * Checks if settings_data.json contains an enabled app embed.
 */
function hasAppEmbedInSettings(content: string | undefined): boolean {
    if (!content) {
        return false;
    }

    try {
        const settings = JSON.parse(content);
        const current = settings?.current;
        if (!current) {
            return false;
        }

        const blocks: Record<string, { type?: string; disabled?: boolean }> =
            current.blocks ?? {};

        return Object.values(blocks).some((block) => {
            if (block.disabled) {
                return false;
            }
            const type = block.type ?? "";
            return APP_SLUGS.some((slug) =>
                type.includes(`shopify://apps/${slug}/blocks/${EMBED_HANDLE}`),
            );
        });
    } catch {
        return false;
    }
}

/**
 * Checks the widget block status for a given shop using GraphQL Theme API.
 */
export async function checkWidgetBlockStatusAction(
    sessionToken: string,
): Promise<ApiResponse<WidgetStatus>> {
    try {
        const { session, shop } = await handleSessionToken(sessionToken);

        if (!session?.accessToken) {
            return { status: "error", message: "No access token" };
        }

        const { accessToken } = session;

        // 1. Get the main (published) theme
        const themesResult = await executeGraphQLQuery<GetMainThemeQuery>({
            query: GetMainThemeDocument,
            shop,
            accessToken,
        });

        const mainTheme = themesResult.data?.themes?.nodes?.[0];

        if (!mainTheme) {
            return { status: "error", message: "No published theme found" };
        }

        // 2. Fetch well-known templates + settings_data.json in one query
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
            const content = await getFileContent(file.body);

            if (file.filename === "config/settings_data.json") {
                if (hasAppEmbedInSettings(content)) {
                    hasAppEmbed = true;
                }
                continue;
            }

            checkedTemplates.push(`${mainTheme.name}:${file.filename}`);
            if (!hasWidgetBlock && hasWidgetBlockInContent(content)) {
                hasWidgetBlock = true;
            }
        }

        // 3. If not found in well-known templates, scan all JSON templates/sections
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
            status: "success",
            data: {
                hasWidgetBlock,
                hasAppEmbed,
                isFullyIntegrated: hasWidgetBlock,
                checkedTemplates,
                checkedSections: [],
                detectedInTheme: hasWidgetBlock ? mainTheme.name : null,
            },
        };
    } catch (err) {
        console.error("[checkWidgetBlockStatus] Error:", err);
        return {
            status: "error",
            message: "Failed to check widget block status",
        };
    }
}

/**
 * Fallback: fetch ALL JSON templates and sections to find widget blocks.
 * Uses GraphQL theme files query with glob-style filenames.
 */
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

    if (toCheck.length === 0) {
        return { found: false, filesWithWidget: [] };
    }

    const result = await executeGraphQLQuery<GetThemeFilesQuery>({
        query: GetThemeFilesDocument,
        variables: { themeId, filenames: toCheck },
        shop,
        accessToken,
    });

    const files = result.data?.theme?.files?.nodes ?? [];

    for (const file of files) {
        const content = await getFileContent(file.body);
        if (hasWidgetBlockInContent(content)) {
            return {
                found: true,
                filesWithWidget: [`${themeName}:${file.filename}`],
            };
        }
    }

    return { found: false, filesWithWidget: [] };
}
