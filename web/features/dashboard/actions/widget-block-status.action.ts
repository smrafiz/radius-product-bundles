"use server";

import type { ApiResponse } from "@/shared";
import { handleSessionToken } from "@/lib/shopify";
import type { WidgetStatus } from "@/features/dashboard";
import { SHOPIFY_API_VERSION } from "@/shared/constants";

const APP_SLUGS = [
    "product-bundles",
    "product-bundles47",
    "product-bundle-widget",
    "radius-bundles",
    "radius-product-bundles",
];
const BLOCK_HANDLE = "app-block";
const EMBED_HANDLE = "app-embed";

/**
 * Fetches a single asset from a theme.
 * Returns null if the asset is not found.
 */
async function fetchAsset(
    shop: string,
    themeId: string,
    accessToken: string,
    assetKey: string,
): Promise<string | null> {
    const res = await fetch(
        `https://${shop}/admin/api/${SHOPIFY_API_VERSION}/themes/${themeId}/assets.json?asset[key]=${encodeURIComponent(assetKey)}`,
        {
            headers: {
                "X-Shopify-Access-Token": accessToken,
                "Content-Type": "application/json",
            },
        },
    );

    if (!res.ok) {
        return null;
    }

    const data = await res.json();
    return data.asset?.value ?? null;
}

/**
 * Lists all asset keys in a theme, then fetches JSON templates/sections
 * individually to check for widget block references.
 * The listing endpoint only returns keys (no values), so we must fetch
 * each candidate asset separately.
 *
 * Fetches up to 5 candidates concurrently to reduce total scan time.
 */
async function scanJsonAssetsForWidget(
    shop: string,
    themeId: string,
    accessToken: string,
): Promise<{ found: boolean; filesWithWidget: string[] }> {
    const candidateKeys: string[] = [];

    let pageInfo: string | null = null;
    do {
        let url = `https://${shop}/admin/api/${SHOPIFY_API_VERSION}/themes/${themeId}/assets.json?limit=250`;
        if (pageInfo) {
            url += `&page_info=${pageInfo}`;
        }

        const res = await fetch(url, {
            headers: {
                "X-Shopify-Access-Token": accessToken,
                "Content-Type": "application/json",
            },
        });

        if (!res.ok) {
            break;
        }

        const linkHeader = res.headers.get("link");
        if (linkHeader) {
            const nextMatch = linkHeader.match(
                /<[^>]*page_info=([^>]+)>; rel="next"/,
            );
            pageInfo = nextMatch ? nextMatch[1] : null;
        } else {
            pageInfo = null;
        }

        const data = await res.json();
        for (const asset of data.assets ?? []) {
            const key: string = asset.key;
            if (
                (key.startsWith("templates/") && key.endsWith(".json")) ||
                (key.startsWith("sections/") && key.endsWith(".json"))
            ) {
                candidateKeys.push(key);
            }
        }
    } while (pageInfo);

    // Fetch candidates in parallel batches to reduce scan time
    const BATCH_SIZE = 5;
    for (let i = 0; i < candidateKeys.length; i += BATCH_SIZE) {
        const batch = candidateKeys.slice(i, i + BATCH_SIZE);
        const results = await Promise.all(
            batch.map((key) => fetchAsset(shop, themeId, accessToken, key)),
        );
        for (let j = 0; j < results.length; j++) {
            if (results[j] && hasWidgetBlockInAsset(results[j])) {
                return { found: true, filesWithWidget: [batch[j]] };
            }
        }
    }

    return { found: false, filesWithWidget: [] };
}

/**
 * Checks if a JSON template contains a widget block reference.
 */
function hasWidgetBlockInAsset(assetValue: string | null): boolean {
    if (!assetValue) {
        return false;
    }

    // Shopify JSON templates store URLs with escaped forward slashes (\/)
    // Normalize before matching so "shopify:\/\/apps\/..." becomes "shopify://apps/..."
    const normalized = assetValue.replaceAll("\\/", "/");

    return APP_SLUGS.some((slug) =>
        normalized.includes(`shopify://apps/${slug}/blocks/${BLOCK_HANDLE}`),
    );
}

/**
 * Checks if a theme settings file contains an app embed reference.
 */
function hasAppEmbedInSettings(settingsValue: string | null): boolean {
    if (!settingsValue) {
        return false;
    }

    const normalized = settingsValue.replaceAll("\\/", "/");

    return APP_SLUGS.some((slug) =>
        normalized.includes(`shopify://apps/${slug}/blocks/${EMBED_HANDLE}`),
    );
}

/**
 * Check a single theme for widget block and app embed presence.
 */
async function checkThemeForWidget(
    shop: string,
    themeId: string,
    themeName: string,
    accessToken: string,
): Promise<{
    hasWidgetBlock: boolean;
    hasAppEmbed: boolean;
    checkedTemplates: string[];
}> {
    let hasWidgetBlock = false;
    let hasAppEmbed = false;
    const checkedTemplates: string[] = [];

    // 1. Check well-known templates for widget block
    const templatesToCheck = [
        "templates/product.json",
        "sections/main-product.liquid",
        "templates/index.json",
        "templates/page.json",
        "templates/collection.json",
    ];

    for (const template of templatesToCheck) {
        const assetValue = await fetchAsset(
            shop,
            themeId,
            accessToken,
            template,
        );

        if (assetValue !== null) {
            checkedTemplates.push(`${themeName}:${template}`);
            if (hasWidgetBlockInAsset(assetValue)) {
                hasWidgetBlock = true;
                break;
            }
        }
    }

    // 2. Fallback: scan remaining JSON templates/sections
    if (!hasWidgetBlock) {
        const scanResult = await scanJsonAssetsForWidget(
            shop,
            themeId,
            accessToken,
        );
        if (scanResult.found) {
            hasWidgetBlock = true;
            checkedTemplates.push(
                ...scanResult.filesWithWidget.map((f) => `${themeName}:${f}`),
            );
        }
    }

    // 3. Check app embed in settings
    const settingsValue = await fetchAsset(
        shop,
        themeId,
        accessToken,
        "config/settings_data.json",
    );

    if (settingsValue && hasAppEmbedInSettings(settingsValue)) {
        hasAppEmbed = true;
    }

    return { hasWidgetBlock, hasAppEmbed, checkedTemplates };
}

/**
 * Checks the widget block status for a given shop.
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

        const themesRes = await fetch(
            `https://${shop}/admin/api/${SHOPIFY_API_VERSION}/themes.json`,
            { headers: { "X-Shopify-Access-Token": accessToken } },
        );

        if (!themesRes.ok) {
            return { status: "error", message: "Failed to fetch themes" };
        }

        const { themes } = await themesRes.json();

        const mainTheme = (themes ?? []).find(
            (t: { role: string }) => t.role === "main",
        );

        if (!mainTheme) {
            return { status: "error", message: "No published theme found" };
        }

        let hasWidgetBlock = false;
        let hasAppEmbed = false;
        let detectedInTheme: string | null = null;
        const allCheckedTemplates: string[] = [];

        // Check the published (main) theme — this is what customers see
        const mainResult = await checkThemeForWidget(
            shop,
            mainTheme.id,
            mainTheme.name,
            accessToken,
        );
        allCheckedTemplates.push(...mainResult.checkedTemplates);

        if (mainResult.hasWidgetBlock) {
            hasWidgetBlock = true;
            detectedInTheme = mainTheme.name;
        }
        if (mainResult.hasAppEmbed) {
            hasAppEmbed = true;
        }

        return {
            status: "success",
            data: {
                hasWidgetBlock,
                hasAppEmbed,
                isFullyIntegrated: hasWidgetBlock,
                checkedTemplates: allCheckedTemplates,
                checkedSections: [],
                detectedInTheme,
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
