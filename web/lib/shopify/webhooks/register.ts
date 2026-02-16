import shopify from "@/lib/shopify/config/initialize-context";
import { DeliveryMethod, Session } from "@shopify/shopify-api";
import { setupGDPRWebHooks } from "@/lib/shopify";
import {
    handleAppUninstalled,
    handleOrdersCreate,
    handleProductsDelete,
    handleShopUpdate,
} from "@/features/webhooks/handlers";

let webhooksInitialized = false;

/**
 * Add webhook handlers to the Shopify API instance
 */
export function addHandlers() {
    if (!webhooksInitialized) {
        console.log("[Webhooks] Adding webhook handlers...");

        setupGDPRWebHooks("/api/webhooks");

        shopify.webhooks.addHandlers({
            APP_UNINSTALLED: {
                deliveryMethod: DeliveryMethod.Http,
                callbackUrl: "/api/webhooks",
                callback: async (_topic, shop, body) => {
                    console.log(
                        `[Webhooks] APP_UNINSTALLED received for ${shop}`,
                    );
                    await handleAppUninstalled(shop, body);
                },
            },
            SHOP_UPDATE: {
                deliveryMethod: DeliveryMethod.Http,
                callbackUrl: "/api/webhooks",
                callback: async (_topic, shop, body) => {
                    console.log(`[Webhooks] SHOP_UPDATE received for ${shop}`);
                    await handleShopUpdate(shop, body);
                },
            },
            ORDERS_CREATE: {
                deliveryMethod: DeliveryMethod.Http,
                callbackUrl: "/api/webhooks",
                callback: async (_topic, shop, body) => {
                    console.log(
                        `[Webhooks] ORDERS_CREATE received for ${shop}`,
                    );
                    await handleOrdersCreate(shop, body);
                },
            },
            PRODUCTS_DELETE: {
                deliveryMethod: DeliveryMethod.Http,
                callbackUrl: "/api/webhooks",
                callback: async (_topic, shop, body) => {
                    console.log(
                        `[Webhooks] PRODUCTS_DELETE received for ${shop}`,
                    );
                    await handleProductsDelete(shop, body);
                },
            },
        });

        webhooksInitialized = true;
        console.log("[Webhooks] ✅ Handlers added successfully");
    } else {
        console.log("[Webhooks] Handlers already initialized");
    }
}

/**
 * Register webhooks with Shopify
 */
export async function registerWebhooks(session: Session) {
    console.log("[Webhooks] registerWebhooks called for shop:", session.shop);

    // Add handlers first
    addHandlers();

    // Validate session
    if (!session.accessToken) {
        const error = `No access token in session for shop: ${session.shop}`;
        console.error("[Webhooks] ❌", error);
        throw new Error(error);
    }

    if (!session.shop) {
        const error = "No shop in session";
        console.error("[Webhooks] ❌", error);
        throw new Error(error);
    }

    console.log("[Webhooks] Session validated:", {
        shop: session.shop,
        hasAccessToken: !!session.accessToken,
        accessTokenPrefix: session.accessToken.substring(0, 10) + "...",
        isOnline: session.isOnline,
        state: session.state,
    });

    try {
        console.log("[Webhooks] Calling shopify.webhooks.register...");

        const responses = await shopify.webhooks.register({ session });

        console.log("[Webhooks] ✅ Registration API call completed");
        console.log(
            "[Webhooks] Number of responses:",
            Object.keys(responses).length,
        );

        // Log each webhook registration result
        for (const [topic, results] of Object.entries(responses)) {
            console.log(`[Webhooks] Topic: ${topic}`);
            console.log(`[Webhooks]   - Results count: ${results.length}`);

            results.forEach((result, index) => {
                console.log(`[Webhooks]   - Result ${index}:`, {
                    success: result.success,
                    result: result.result,
                });
            });
        }

        return responses;
    } catch (error) {
        console.error("[Webhooks] ❌ Registration failed");
        console.error("[Webhooks] Error type:", error?.constructor?.name);
        console.error(
            "[Webhooks] Error message:",
            error instanceof Error ? error.message : String(error),
        );

        if (error instanceof Error) {
            console.error("[Webhooks] Stack trace:", error.stack);
        }

        console.error(
            "[Webhooks] Full error object:",
            JSON.stringify(error, Object.getOwnPropertyNames(error), 2),
        );

        throw error;
    }
}
