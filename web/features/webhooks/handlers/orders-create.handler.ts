import {
    ShopifyOrder,
    ShopifyLineItem,
    ShopifyLineItemProperty,
} from "@/shared";
import { trackBundlePurchase } from "@/features/analytics/repositories";

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

        // GROUP BY BUNDLE ID
        const bundlesMap = new Map<
            string,
            {
                items: ShopifyLineItem[];
                totalRevenue: number;
            }
        >();

        for (const item of bundleItems) {
            const bundleId = item.properties?.find(
                (p: ShopifyLineItemProperty) => p.name === "_bundle_id",
            )?.value;

            if (bundleId) {
                // ✅ CALCULATE ACTUAL REVENUE (price - discount_allocations)
                const originalPrice = parseFloat(item.price);
                const quantity = item.quantity;

                // Get discount from discount_allocations
                let totalDiscount = 0;
                if ((item as any).discount_allocations) {
                    for (const allocation of (item as any)
                        .discount_allocations) {
                        totalDiscount += parseFloat(allocation.amount);
                    }
                }

                // ✅ CORRECT: Original price - discount
                const actualPrice = originalPrice - totalDiscount;
                const itemRevenue = actualPrice * quantity;

                console.log(`[Orders Handler] Item: ${item.title}`);
                console.log(`  Original price: €${originalPrice.toFixed(2)}`);
                console.log(`  Discount: €${totalDiscount.toFixed(2)}`);
                console.log(`  Actual price: €${actualPrice.toFixed(2)}`);
                console.log(`  Revenue: €${itemRevenue.toFixed(2)}`);

                if (bundlesMap.has(bundleId)) {
                    const existing = bundlesMap.get(bundleId)!;
                    existing.items.push(item);
                    existing.totalRevenue += itemRevenue;
                } else {
                    bundlesMap.set(bundleId, {
                        items: [item],
                        totalRevenue: itemRevenue,
                    });
                }
            }
        }

        let isNewCustomer = false;

        if (order.customer) {
            // Method 1: Check if orders_count exists and equals 1
            if (typeof order.customer.orders_count === "number") {
                isNewCustomer = order.customer.orders_count === 1;
            } else {
                // Method 2: Check if customer was created within last 5 minutes
                if (order.customer.created_at) {
                    const customerCreated = new Date(order.customer.created_at);
                    const orderCreated = new Date(order.created_at);
                    const timeDiff =
                        orderCreated.getTime() - customerCreated.getTime();
                    const fiveMinutes = 5 * 60 * 1000;

                    // If the customer was created within 5 minutes of order, they're new
                    isNewCustomer = timeDiff < fiveMinutes;
                } else {
                    isNewCustomer = false;
                }
            }
        }

        // Track each unique bundle at once
        for (const [bundleId, bundleData] of bundlesMap.entries()) {
            await trackBundlePurchase({
                bundleId,
                revenue: bundleData.totalRevenue,
                customerId: order.customer?.id?.toString(),
                isNewCustomer,
                timestamp: new Date(order.created_at),
            });

            console.log(
                `[Orders Handler] ✅ Tracked: Bundle ${bundleId}, Items: ${bundleData.items.length}, Revenue: €${bundleData.totalRevenue.toFixed(2)}, Customer: ${isNewCustomer ? "NEW" : "RETURNING"}`,
            );
        }
    } catch (error) {
        console.error(`[Orders Handler] ❌ Error:`, error);
    }
}
