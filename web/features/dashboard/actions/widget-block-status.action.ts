"use server";

import { handleSessionToken } from "@/lib/shopify";
import { ApiResponse } from "@/shared";

const API_VERSION = "2025-10";
// App handle from shopify.app.toml — used to identify our blocks in template JSON
const APP_HANDLE = "product-bundles47";
const BLOCK_HANDLE = "app-block";

export async function checkWidgetBlockStatusAction(
    sessionToken: string,
): Promise<ApiResponse<boolean>> {
    try {
        const { session, shop } = await handleSessionToken(sessionToken);
        if (!session?.accessToken) {
            return { status: "error", message: "No access token" };
        }

        const { accessToken } = session;
        const headers = { "X-Shopify-Access-Token": accessToken };

        // Get active (main) theme
        const themesRes = await fetch(
            `https://${shop}/admin/api/${API_VERSION}/themes.json?role=main`,
            { headers },
        );
        if (!themesRes.ok) {
            return { status: "error", message: "Failed to fetch themes" };
        }
        const { themes } = await themesRes.json();
        const activeTheme = themes?.[0];
        if (!activeTheme) {
            return { status: "success", data: false };
        }

        // Read the product template JSON
        const assetRes = await fetch(
            `https://${shop}/admin/api/${API_VERSION}/themes/${activeTheme.id}/assets.json?asset[key]=templates/product.json`,
            { headers },
        );
        if (!assetRes.ok) {
            // Liquid-only theme or no product.json — can't detect
            return { status: "success", data: false };
        }
        const { asset } = await assetRes.json();
        if (!asset?.value) {
            return { status: "success", data: false };
        }

        // Check if our app block appears anywhere in the template
        const blockTypePrefix = `shopify://apps/${APP_HANDLE}/blocks/${BLOCK_HANDLE}`;
        const hasBlock = (asset.value as string).includes(blockTypePrefix);

        return { status: "success", data: hasBlock };
    } catch (err) {
        console.error("[checkWidgetBlockStatus] Error:", err);
        return { status: "error", message: "Failed to check widget block status" };
    }
}
