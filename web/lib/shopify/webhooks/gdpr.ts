import shopify from "../config/initialize-context";
import { DeliveryMethod } from "@shopify/shopify-api";
import { prisma } from "@/shared/repositories/prisma-connect";
import { deleteShopData } from "@/features/webhooks/repositories";

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
                try {
                    const payload = JSON.parse(body);
                    const rawCustomerId = payload.customer?.id;
                    const customerEmail = payload.customer?.email;
                    const dataRequestId = payload.data_request?.id;

                    if (!rawCustomerId) {
                        console.warn(
                            "[GDPR] No customer ID in data request payload",
                        );
                        return;
                    }

                    const customerId = String(rawCustomerId);

                    // Extract all customer-specific data from our database
                    // BundleView is the only model that stores customer-identifiable data
                    const customerViews = await prisma.bundleView.findMany({
                        where: { customerId },
                        select: {
                            bundleId: true,
                            date: true,
                            timestamp: true,
                        },
                    });

                    // Compile customer data summary
                    const customerData = {
                        customer_id: customerId,
                        customer_email: customerEmail,
                        shop,
                        data_request_id: dataRequestId,
                        data: {
                            bundle_views: customerViews.map((view) => ({
                                bundle_id: view.bundleId,
                                date: view.date,
                                timestamp: view.timestamp.toISOString(),
                            })),
                        },
                        note: "This app stores bundle view tracking data only. No personal information (name, email, address) is stored by this app.",
                    };

                    // Log the compiled data for the merchant to fulfill the request.
                    // Per GDPR / Shopify requirements, the merchant must provide this
                    // data to the customer within 30 days of the request.
                    console.log(
                        "[GDPR] customers/data_request — compiled customer data for merchant review.",
                        "shop:", shop,
                        "| data_request_id:", dataRequestId,
                        "| customer_id:", customerId,
                        "| bundle_views_count:", customerViews.length,
                        "| payload:", JSON.stringify(customerData),
                    );

                } catch (error) {
                    console.error("[GDPR] Data request error:", error);
                    throw error;
                }
            },
        },
        CUSTOMERS_REDACT: {
            deliveryMethod: DeliveryMethod.Http,
            callbackUrl: path,
            callback: async (topic, shop, body) => {
                try {
                    const payload = JSON.parse(body);
                    const rawCustomerId = payload.customer?.id;

                    if (!rawCustomerId) {
                        console.warn(
                            "[GDPR] No customer ID in redaction payload",
                        );
                        return;
                    }

                    const customerId = String(rawCustomerId);

                    // Delete all BundleView records for this customer
                    // BundleView stores: customerId, sessionId, bundleId, date, timestamp
                    const deletedViews = await prisma.bundleView.deleteMany({
                        where: {
                            customerId,
                            bundle: { shop },
                        },
                    });

                    // BundleAnalytics is aggregated (no customer-level data) — nothing to redact
                } catch (error) {
                    console.error("[GDPR] Redaction error:", error);
                    throw error;
                }
            },
        },
        SHOP_REDACT: {
            deliveryMethod: DeliveryMethod.Http,
            callbackUrl: path,
            callback: async (topic, shop, body) => {
                try {
                    await deleteShopData(shop);
                } catch (error) {
                    console.error("[GDPR] Shop redaction error:", error);
                    throw error;
                }
            },
        },
    });
}
