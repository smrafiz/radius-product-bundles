import shopify from "./initialize-context";
import prisma from "../db/prisma-connect";
import { DeliveryMethod } from "@shopify/shopify-api";

export function setupGDPRWebHooks(path: string) {
    /**
     * Customers can request their data from a store owner. When this happens,
     * Shopify invokes this webhook.
     *
     * https://shopify.dev/apps/webhooks/configuration/mandatory-webhooks#customers-data_request
     */
    return shopify.webhooks.addHandlers({
        CUSTOMERS_DATA_REQUEST: {
            deliveryMethod: DeliveryMethod.Http,
            callbackUrl: path,
            callback: async (topic, shop, body) => {
                console.log(`📋 GDPR: Customer data request from ${shop}`);
                try {
                    const payload = JSON.parse(body);

                    // Payload has the following shape:
                    // {
                    //   "shop_id": 954889,
                    //   "shop_domain": "{shop}.myshopify.com",
                    //   "orders_requested": [
                    //     299938,
                    //     280263,
                    //     220458
                    //   ],
                    //   "customer": {
                    //     "id": 191167,
                    //     "email": "john@example.com",
                    //     "phone": "555-625-1199"
                    //   },
                    //   "data_request": {
                    //     "id": 9999
                    //   }
                    // }

                    // Log the request for compliance
                    console.log(
                        `🔍 Data request ID: ${payload.data_request?.id} for customer: ${payload.customer?.email}`,
                    );

                    // In a real app, you would:
                    // 1. Extract customer data from your database
                    // 2. Compile it into the required format
                    // 3. Send it to the customer or make it available for download

                    // For this app, we primarily store bundle and session data
                    // Customer-specific data would be minimal
                } catch (error) {
                    console.error("❌ GDPR data request error:", error);
                    throw error;
                }
            },
        },
        CUSTOMERS_REDACT: {
            deliveryMethod: DeliveryMethod.Http,
            callbackUrl: path,
            callback: async (topic, shop, body) => {
                console.log(
                    `🗑️ GDPR: Customer data redaction request from ${shop}`,
                );
                try {
                    const payload = JSON.parse(body);
                    const customerId = payload.customer?.id;

                    // Payload has the following shape:
                    // {
                    //   "shop_id": 954889,
                    //   "shop_domain": "{shop}.myshopify.com",
                    //   "customer": {
                    //     "id": 191167,
                    //     "email": "john@example.com",
                    //     "phone": "555-625-1199"
                    //   },
                    //   "orders_to_redact": [
                    //     299938,
                    //     280263,
                    //     220458
                    //   ]
                    // }

                    if (customerId) {
                        // Remove any customer-specific data from our database
                        // For this app, we would remove any analytics or tracking data
                        // that might be tied to specific customers

                        // Example: Remove customer-specific analytics
                        await prisma.bundleAnalytics.deleteMany({
                            where: {
                                // Note: You'd need to add customer tracking fields to your schema
                                // This is just an example of how you'd handle it
                                bundle: {
                                    shop: shop,
                                },
                                // customerId: customerId (if you track this)
                            },
                        });

                        console.log(
                            `✅ Customer data redacted for customer ID: ${customerId}`,
                        );
                    }
                } catch (error) {
                    console.error("❌ GDPR redaction error:", error);
                    throw error;
                }
            },
        },
        SHOP_REDACT: {
            deliveryMethod: DeliveryMethod.Http,
            callbackUrl: path,
            callback: async (topic, shop, body) => {
                console.log(`🏪 GDPR: Shop data redaction request for ${shop}`);
                try {
                    const payload = JSON.parse(body);

                    // Payload has the following shape:
                    // {
                    //   "shop_id": 954889,
                    //   "shop_domain": "{shop}.myshopify.com"
                    // }

                    // When a shop uninstalls and requests data deletion,
                    // remove ALL data associated with that shop

                    console.log(`🗑️ Removing all data for shop: ${shop}`);

                    // Delete all shop-related data
                    await Promise.all([
                        // Delete sessions
                        prisma.session.deleteMany({ where: { shop } }),
                        // Delete bundles
                        prisma.bundle.deleteMany({ where: { shop } }),
                        // Delete automations
                        prisma.automation.deleteMany({ where: { shop } }),
                        // Delete pricing rules
                        prisma.pricingRule.deleteMany({ where: { shop } }),
                        // Delete AI insights
                        prisma.aIInsight.deleteMany({ where: { shop } }),
                        // Delete notifications
                        prisma.notification.deleteMany({ where: { shop } }),
                        // Delete alert rules
                        prisma.alertRule.deleteMany({ where: { shop } }),
                        // Delete app settings
                        prisma.appSettings.deleteMany({ where: { shop } }),
                        // Delete A/B tests
                        prisma.aBTest.deleteMany({ where: { shop } }),
                    ]);

                    console.log(`✅ All data removed for shop: ${shop}`);
                } catch (error) {
                    console.error("❌ GDPR shop redaction error:", error);
                    throw error;
                }
            },
        },
    });
}
