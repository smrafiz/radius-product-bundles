"use server";

import {
    ClearCacheResult,
    SyncMetafieldResult,
    WebhookCheckResult,
    WebhookRegisterResult,
} from "@/features/settings";
import { ApiResponse } from "@/shared";
import { handleSessionToken } from "@/lib/shopify";
import {
    clearCacheService,
    checkWebhooksService,
    forceRegisterWebhooksService,
    syncMetafieldsService,
} from "@/features/settings/services/tools.service";

export async function clearCacheAction(
    sessionToken: string,
): Promise<ApiResponse<ClearCacheResult>> {
    try {
        const {
            session: { shop },
        } = await handleSessionToken(sessionToken);

        const data = await clearCacheService();

        return { status: "success", data };
    } catch (error) {
        console.error("[clearCache] Error:", error);
        return {
            status: "error",
            message:
                error instanceof Error
                    ? error.message
                    : "Failed to clear cache",
        };
    }
}

export async function syncMetafieldsAction(
    sessionToken: string,
): Promise<ApiResponse<SyncMetafieldResult>> {
    try {
        const {
            session: { shop },
        } = await handleSessionToken(sessionToken);

        const data = await syncMetafieldsService(sessionToken, shop);

        return { status: "success", data };
    } catch (error) {
        console.error("[syncMetafields] Error:", error);
        return {
            status: "error",
            message:
                error instanceof Error
                    ? error.message
                    : "Failed to sync metafields",
        };
    }
}

export async function checkWebhooksAction(
    sessionToken: string,
): Promise<ApiResponse<WebhookCheckResult>> {
    try {
        await handleSessionToken(sessionToken);

        const data = await checkWebhooksService(sessionToken);

        return { status: "success", data };
    } catch (error) {
        console.error("[checkWebhooks] Error:", error);
        return {
            status: "error",
            message:
                error instanceof Error
                    ? error.message
                    : "Failed to check webhooks",
        };
    }
}

export async function forceRegisterWebhooksAction(
    sessionToken: string,
): Promise<ApiResponse<WebhookRegisterResult>> {
    try {
        const { session } = await handleSessionToken(sessionToken);
        const shop = session.shop;

        const data = await forceRegisterWebhooksService(
            sessionToken,
            session,
            shop,
        );

        return { status: "success", data };
    } catch (error) {
        console.error("[forceRegisterWebhooks] Error:", error);
        return {
            status: "error",
            message:
                error instanceof Error
                    ? error.message
                    : "Failed to register webhooks",
        };
    }
}
