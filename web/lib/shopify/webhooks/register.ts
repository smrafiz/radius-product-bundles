import { AppInstallations } from "@/shared/repositories";
import shopify from "@/lib/shopify/config/initialize-context";
import { DeliveryMethod, Session } from "@shopify/shopify-api";
import { handleShopUpdate, setupGDPRWebHooks } from "@/lib/shopify";
import { trackBundlePurchase } from "@/features/analytics/repositories";
import { ShopifyLineItem, ShopifyLineItemProperty, ShopifyOrder } from "@/shared";

let webhooksInitialized = false;

/**
 * Add webhook handlers
 */
export function addHandlers() {
    if (!webhooksInitialized) {
        console.log("[Webhooks] Adding webhook handlers...");

        setupGDPRWebHooks("/api/webhooks");

        shopify.webhooks.addHandlers({
            ["APP_UNINSTALLED"]: {
                deliveryMethod: DeliveryMethod.Http,
                callbackUrl: "/api/webhooks",
                callback: async (_topic, shop, _body) => {
                    console.log("Uninstalled app from shop: " + shop);
                    await AppInstallations.delete(shop);
                },
            },
            ["SHOP_UPDATE"]: {
                deliveryMethod: DeliveryMethod.Http,
                callbackUrl: "/api/webhooks",
                callback: async (topic, shop, body) => {
                    console.log(`Received ${topic} webhook for ${shop}`);
                    await handleShopUpdate(shop, body);
                },
            },
            ["ORDERS_CREATE"]: {
                deliveryMethod: DeliveryMethod.Http,
                callbackUrl: "/api/webhooks",
                callback: async (topic, shop, body) => {
                    try {
                        const order: ShopifyOrder = JSON.parse(body);

                        console.log(`[Order Webhook] Processing order ${order.name} from ${shop}`);

                        // Find all line items with the bundle_id property
                        const bundleItems = order.line_items.filter((item: ShopifyLineItem) =>
                            item.properties?.some(
                                (prop: ShopifyLineItemProperty) => prop.name === "_bundle_id",
                            ),
                        );

                        if (bundleItems.length === 0) {
                            console.log(`[Order Webhook] No bundles found in order ${order.name}`);
                            return;
                        }

                        console.log(`[Order Webhook] Found ${bundleItems.length} bundle item(s)`);

                        // Track each bundle item
                        for (const item of bundleItems) {
                            const bundleId = item.properties?.find(
                                (p: ShopifyLineItemProperty) => p.name === "_bundle_id",
                            )?.value;

                            if (bundleId) {
                                const revenue = parseFloat(item.price) * item.quantity;

                                await trackBundlePurchase({
                                    bundleId,
                                    revenue,
                                    customerId: order.customer?.id?.toString(),
                                    isNewCustomer: (order.customer?.orders_count || 0) === 1,
                                    timestamp: new Date(order.created_at),
                                });

                                console.log(`[Order Webhook] Tracked purchase: Bundle ${bundleId}, Revenue $${revenue}`);
                            }
                        }
                    } catch (error) {
                        console.error(`[Order Webhook] Error processing order:`, error);
                    }
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
        console.log("[Webhooks] Number of responses:", Object.keys(responses).length);

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
        console.error("[Webhooks] Error message:", error instanceof Error ? error.message : String(error));

        if (error instanceof Error) {
            console.error("[Webhooks] Stack trace:", error.stack);
        }

        // Log full error object
        console.error("[Webhooks] Full error object:", JSON.stringify(error, Object.getOwnPropertyNames(error), 2));

        throw error;
    }
}
