import { Session } from "@shopify/shopify-api";
import { ensureAppSetup } from "@/lib/shopify/setup/ensure-setup";
import {
    getShopSetupStatus,
    markSetupComplete,
    markWebhooksRegistered,
    updateLastSetupCheck,
    getOfflineSession,
    registerWebhooksWithShopify,
} from "../repositories";

/**
 * Webhook Service - Business Logic Layer
 *
 * Orchestrates webhook registration and setup
 */

/**
 * Check if initialization is needed (single DB query)
 */
export async function checkInitializationNeeded(shop: string): Promise<{
    setupNeeded: boolean;
    webhooksNeeded: boolean;
}> {
    const { setupComplete, webhooksRegistered } = await getShopSetupStatus(shop);

    return {
        setupNeeded: !setupComplete,
        webhooksNeeded: !webhooksRegistered,
    };
}

/**
 * Run app setup if needed
 */
export async function runSetupIfNeeded(
    sessionToken: string,
    shop: string,
): Promise<{ success: boolean; errors?: string[] }> {
    const { setupNeeded } = await checkInitializationNeeded(shop);

    if (!setupNeeded) {
        return { success: true };
    }

    const setupResult = await ensureAppSetup(sessionToken);

    if (setupResult.success) {
        await markSetupComplete(shop);
    } else {
        console.warn(
            "[Webhook Service] ⚠️ Setup warnings:",
            setupResult.errors,
        );
    }

    return setupResult;
}

/**
 * Get best session for webhook registration
 */
async function getBestSession(
    session: Session,
    shop: string,
): Promise<Session> {
    const offlineSession = await getOfflineSession(shop);

    if (offlineSession && offlineSession.accessToken) {
        return new Session({
            id: offlineSession.id,
            shop: offlineSession.shop,
            state: offlineSession.state,
            isOnline: offlineSession.isOnline,
            accessToken: offlineSession.accessToken,
            scope: offlineSession.scope || undefined,
            expires: offlineSession.expires || undefined,
        });
    }

    return session;
}

/**
 * Register webhooks if needed
 */
export async function registerWebhooksIfNeeded(
    session: Session,
    shop: string,
): Promise<void> {
    const { webhooksNeeded } = await checkInitializationNeeded(shop);

    if (!webhooksNeeded) {
        return;
    }

    // Get best session
    const sessionToUse = await getBestSession(session, shop);

    if (!sessionToUse || !sessionToUse.accessToken) {
        throw new Error("No valid session available for webhook registration");
    }

    try {
        // Register with Shopify
        const responses = await registerWebhooksWithShopify(sessionToUse);

        // Log results
        for (const [topic, results] of Object.entries(responses)) {
            if (results.length > 0) {
                const result = results[0];
                if (!result.success) {
                    const resultWithData = result.result as {
                        data?: {
                            webhookSubscriptionCreate?: {
                                userErrors?: unknown[];
                            };
                        };
                    };
                    const userErrors =
                        resultWithData.data?.webhookSubscriptionCreate
                            ?.userErrors ?? [];
                    if (userErrors.length > 0) {
                        console.error(
                            `[Webhook Service] ❌ ${topic} failed:`,
                            JSON.stringify(userErrors, null, 2),
                        );
                    }
                }
            }
        }

        await markWebhooksRegistered(shop);
    } catch (webhookError) {
        console.error("[Webhook Service] ❌ Webhook registration error:", {
            error:
                webhookError instanceof Error
                    ? webhookError.message
                    : String(webhookError),
            stack: webhookError instanceof Error ? webhookError.stack : null,
            sessionInfo: {
                shop: sessionToUse.shop,
                hasAccessToken: !!sessionToUse.accessToken,
                isOnline: sessionToUse.isOnline,
            },
        });
        throw webhookError;
    }
}

/**
 * Complete initialization flow
 */
export async function initializeApp(
    sessionToken: string,
    session: Session,
): Promise<{
    success: boolean;
    errors?: string[];
}> {
    const shop = session.shop;
    const errors: string[] = [];

    try {
        // Single DB query for both flags — passed down to avoid re-querying
        const status = await checkInitializationNeeded(shop);

        // Step 1: Run setup
        if (status.setupNeeded) {
            const setupResult = await ensureAppSetup(sessionToken);
            if (setupResult.success) {
                await markSetupComplete(shop);
            } else {
                if (setupResult.errors) errors.push(...setupResult.errors);
                console.warn("[Webhook Service] Setup warnings:", setupResult.errors);
            }
        }

        // Step 2: Register webhooks
        try {
            if (status.webhooksNeeded) {
                const sessionToUse = await getBestSession(session, shop);
                if (!sessionToUse?.accessToken) {
                    throw new Error("No valid session for webhook registration");
                }
                await registerWebhooksWithShopify(sessionToUse);
                await markWebhooksRegistered(shop);
            }
        } catch (webhookError) {
            const errorMsg =
                webhookError instanceof Error
                    ? webhookError.message
                    : "Webhook registration failed";
            errors.push(errorMsg);
        }

        // Step 3: Update last check
        await updateLastSetupCheck(shop);

        return {
            success: errors.length === 0,
            errors: errors.length > 0 ? errors : undefined,
        };
    } catch (error) {
        console.error("[Webhook Service] ❌ Initialization failed:", error);
        console.error("[Webhook Service] Error details:", {
            message: error instanceof Error ? error.message : String(error),
            stack: error instanceof Error ? error.stack : null,
        });
        return {
            success: false,
            errors: [error instanceof Error ? error.message : "Unknown error"],
        };
    }
}
