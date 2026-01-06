import { Session } from "@shopify/shopify-api";
import { ensureAppSetup } from "@/lib/shopify/setup/ensure-setup";
import {
    isSetupComplete,
    areWebhooksRegistered,
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
 * Check if initialization is needed
 */
export async function checkInitializationNeeded(shop: string): Promise<{
    setupNeeded: boolean;
    webhooksNeeded: boolean;
}> {
    const [setupDone, webhooksDone] = await Promise.all([
        isSetupComplete(shop),
        areWebhooksRegistered(shop),
    ]);

    return {
        setupNeeded: !setupDone,
        webhooksNeeded: !webhooksDone,
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
        console.log("[Webhook Service] Setup already complete, skipping");
        return { success: true };
    }

    console.log("[Webhook Service] Running app setup...");

    const setupResult = await ensureAppSetup(sessionToken);

    if (setupResult.success) {
        await markSetupComplete(shop);
        console.log("[Webhook Service] ✅ Setup complete");
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
    // Try to find offline session first
    console.log("[Webhook Service] Looking for offline session...");
    const offlineSession = await getOfflineSession(shop);

    if (offlineSession && offlineSession.accessToken) {
        console.log("[Webhook Service] Found offline session:", {
            shop: offlineSession.shop,
            hasAccessToken: !!offlineSession.accessToken,
            isOnline: offlineSession.isOnline,
            scope: offlineSession.scope,
        });

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

    console.log(
        "[Webhook Service] No offline session found, using current session",
    );
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
        console.log("[Webhook Service] Webhooks already registered, skipping");
        return;
    }

    console.log("[Webhook Service] Registering webhooks...");

    // Get best session
    const sessionToUse = await getBestSession(session, shop);

    if (!sessionToUse || !sessionToUse.accessToken) {
        throw new Error("No valid session available for webhook registration");
    }

    console.log("[Webhook Service] Attempting to register webhooks...");

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
                } else {
                    console.log(`[Webhook Service] ✅ ${topic} registered`);
                }
            }
        }

        await markWebhooksRegistered(shop);
        console.log("[Webhook Service] ✅ Webhooks registered");
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

    console.log(`[Webhook Service] Starting initialization for ${shop}`);
    console.log(
        `[Webhook Service] Session token prefix:`,
        sessionToken.substring(0, 20) + "...",
    );
    console.log(`[Webhook Service] Session info:`, {
        shop: session.shop,
        hasAccessToken: !!session.accessToken,
        accessTokenPrefix: session.accessToken?.substring(0, 15) + "...",
        isOnline: session.isOnline,
        scope: session.scope,
    });

    try {
        // Check current status
        const status = await checkInitializationNeeded(shop);
        console.log(
            `[Webhook Service] Status - Setup: ${!status.setupNeeded}, Webhooks: ${!status.webhooksNeeded}`,
        );

        // Step 1: Run setup
        const setupResult = await runSetupIfNeeded(sessionToken, shop);
        if (!setupResult.success && setupResult.errors) {
            errors.push(...setupResult.errors);
        }

        // Step 2: Register webhooks
        try {
            await registerWebhooksIfNeeded(session, shop);
        } catch (webhookError) {
            const errorMsg =
                webhookError instanceof Error
                    ? webhookError.message
                    : "Webhook registration failed";
            errors.push(errorMsg);
        }

        // Step 3: Update last check
        await updateLastSetupCheck(shop);

        console.log("[Webhook Service] ✅ Initialization complete");

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
