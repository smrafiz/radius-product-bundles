"use server";
import { registerWebhooks } from "@/lib/shopify/register-webhooks";
import { handleSessionToken } from "@/lib/shopify/verify";
import { findOfflineSessionByShop } from "@/lib/db/session-storage";

/**
 * Do the server action and return the status
 */
export async function doServerAction(sessionIdToken: string): Promise<{
    status: "success" | "error";
    data?: {
        shop: string;
    };
}> {
    try {
        const {
            session: { shop },
        } = await handleSessionToken(sessionIdToken);

        return {
            status: "success",
            data: {
                shop,
            },
        };
    } catch (error) {
        console.log(error);
        return {
            status: "error",
        };
    }
}

/**
 * Store the session (and access token) in the database
 */
export async function storeToken(sessionToken: string) {
    await handleSessionToken(sessionToken, false, true);
}

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
