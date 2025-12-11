"use server";

import { findOfflineSessionByShop } from "@/shared/repositories";
import { handleSessionToken, registerWebhooks } from "@/lib/shopify";

/**
 * Register the webhooks using the stored offline session
 */
export async function doWebhookRegistration(sessionToken: string) {
    try {
        const { shop } = await handleSessionToken(sessionToken);
        const offlineSession = await findOfflineSessionByShop(shop);
        await registerWebhooks(offlineSession);
    } catch (error) {
        console.error("Webhook registration failed:", error);
        throw error;
    }
}
