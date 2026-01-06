import { trackBundlePurchase } from "@/features/analytics/repositories";
import {
    ShopifyOrder,
    ShopifyLineItem,
    ShopifyLineItemProperty,
} from "@/shared";

/**
 * Handle ORDERS_CREATE webhook
 *
 * Track bundle purchases from orders
 */
export async function handleOrdersCreate(
    shop: string,
    body: string,
): Promise<void> {
    try {
        const order: ShopifyOrder = JSON.parse(body);

        console.log(
            `[Orders Handler] Processing order ${order.name} from ${shop}`,
        );

        // Find line items with the bundle_id property
        const bundleItems = order.line_items.filter((item: ShopifyLineItem) =>
            item.properties?.some(
                (prop: ShopifyLineItemProperty) => prop.name === "_bundle_id",
            ),
        );

        if (bundleItems.length === 0) {
            console.log(`[Orders Handler] No bundles in order ${order.name}`);
            return;
        }

        console.log(
            `[Orders Handler] Found ${bundleItems.length} bundle item(s)`,
        );

        // Track each bundle purchase
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

                console.log(
                    `[Orders Handler] Tracked: Bundle ${bundleId}, Revenue $${revenue}`,
                );
            }
        }
    } catch (error) {
        console.error(`[Orders Handler] ❌ Error:`, error);
    }
}
