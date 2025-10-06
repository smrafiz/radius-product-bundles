"use server";

import { handleSessionToken } from "@/lib/shopify/verify";
import { registerWebhooks } from "@/lib/shopify/register-webhooks";
import { findOfflineSessionByShop } from "@/lib/db/session-storage";

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
