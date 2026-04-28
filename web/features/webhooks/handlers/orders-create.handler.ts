import {
    ShopifyOrder,
    ShopifyLineItem,
    ShopifyLineItemProperty,
} from "@/shared";
import { trackBundlePurchase } from "@/features/analytics/repositories";
import prisma from "@/shared/repositories/prisma-connect";

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

        // Order-level idempotency. Shopify can deliver the same orders/create
        // event with multiple webhook IDs (e.g. retry on transient 5xx),
        // bypassing the per-webhook-id dedup in the route handler. Using a
        // deterministic key on order.id so retries with new webhook IDs are
        // still suppressed for analytics purposes.
        const orderDedupKey = `order-create:${shop}:${order.id}`;
        try {
            await prisma.webhookDelivery.create({
                data: {
                    id: orderDedupKey,
                    topic: "orders/create:order",
                    shop,
                },
            });
        } catch (e: unknown) {
            if (
                typeof e === "object" &&
                e !== null &&
                "code" in e &&
                (e as { code: string }).code === "P2002"
            ) {
                return;
            }
            throw e;
        }

        // Find line items with the bundle_id property
        const bundleItems = order.line_items.filter((item: ShopifyLineItem) =>
            item.properties?.some(
                (prop: ShopifyLineItemProperty) => prop.name === "_bundle_id",
            ),
        );

        if (bundleItems.length === 0) {
            return;
        }

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

        }
    } catch (error) {
        console.error(`[Orders Handler] ❌ Error:`, error);
    }
}
