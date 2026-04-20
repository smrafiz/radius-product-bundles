import shopify from "@/lib/shopify/config/initialize-context";
import { DeliveryMethod, Session } from "@shopify/shopify-api";
import { setupGDPRWebHooks } from "@/lib/shopify";
import {
    handleAppUninstalled,
    handleOrdersCreate,
    handleProductsDelete,
    handleProductsUpdate,
    handleProductsCreate,
    handleShopUpdate,
    handleAppSubscriptionUpdate,
    handleLocalesUpdate,
} from "@/features/webhooks/handlers";

let webhooksInitialized = false;

/**
 * Add webhook handlers to the Shopify API instance
 */
export function addHandlers() {
    if (!webhooksInitialized) {
        setupGDPRWebHooks("/api/webhooks");

        shopify.webhooks.addHandlers({
            APP_UNINSTALLED: {
                deliveryMethod: DeliveryMethod.Http,
                callbackUrl: "/api/webhooks",
                callback: async (_topic, shop, body) => {
                    await handleAppUninstalled(shop, body);
                },
            },
            SHOP_UPDATE: {
                deliveryMethod: DeliveryMethod.Http,
                callbackUrl: "/api/webhooks",
                callback: async (_topic, shop, body) => {
                    await handleShopUpdate(shop, body);
                },
            },
            ORDERS_CREATE: {
                deliveryMethod: DeliveryMethod.Http,
                callbackUrl: "/api/webhooks",
                callback: async (_topic, shop, body) => {
                    await handleOrdersCreate(shop, body);
                },
            },
            PRODUCTS_DELETE: {
                deliveryMethod: DeliveryMethod.Http,
                callbackUrl: "/api/webhooks",
                callback: async (_topic, shop, body) => {
                    await handleProductsDelete(shop, body);
                },
            },
            PRODUCTS_UPDATE: {
                deliveryMethod: DeliveryMethod.Http,
                callbackUrl: "/api/webhooks",
                callback: async (_topic, shop, body) => {
                    await handleProductsUpdate(shop, body);
                },
            },
            PRODUCTS_CREATE: {
                deliveryMethod: DeliveryMethod.Http,
                callbackUrl: "/api/webhooks",
                callback: async (_topic, shop, body) => {
                    await handleProductsCreate(shop, body);
                },
            },
            APP_SUBSCRIPTIONS_UPDATE: {
                deliveryMethod: DeliveryMethod.Http,
                callbackUrl: "/api/webhooks",
                callback: async (_topic, shop, body) => {
                    await handleAppSubscriptionUpdate(shop, body);
                },
            },
            LOCALES_CREATE: {
                deliveryMethod: DeliveryMethod.Http,
                callbackUrl: "/api/webhooks",
                callback: async (_topic, shop) => {
                    await handleLocalesUpdate(shop);
                },
            },
            LOCALES_UPDATE: {
                deliveryMethod: DeliveryMethod.Http,
                callbackUrl: "/api/webhooks",
                callback: async (_topic, shop) => {
                    await handleLocalesUpdate(shop);
                },
            },
        });

        webhooksInitialized = true;
    }
}

/**
 * Register webhooks with Shopify
 */
export async function registerWebhooks(session: Session) {
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

    try {
        const responses = await shopify.webhooks.register({ session });

        const failed = Object.entries(responses)
            .filter(([, results]) => results.some((r) => !r.success))
            .map(([topic]) => topic);

        if (failed.length > 0) {
            console.warn("[Webhooks] Failed topics:", failed.join(", "));
        }

        return responses;
    } catch (error) {
        console.error(
            "[Webhooks] ❌ Registration failed:",
            error instanceof Error ? error.message : String(error),
        );
        throw error;
    }
}
