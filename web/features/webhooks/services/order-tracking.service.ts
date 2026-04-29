import {
    ShopifyOrder,
    ShopifyLineItem,
    ShopifyLineItemProperty,
} from "@/shared";
import { BundleAggregation } from "@/features/webhooks";
import { claimOrderDelivery } from "@/features/webhooks/repositories";
import { trackBundlePurchase } from "@/features/analytics/repositories";

/**
 * Order Tracking Service - Business Logic Layer
 *
 * Translates an orders/create webhook payload into bundle analytics events.
 * Owns the dedup decision and the per-bundle revenue aggregation; delegates
 * persistence to repositories.
 */

function isBundleLineItem(item: ShopifyLineItem): boolean {
    return Boolean(
        item.properties?.some(
            (prop: ShopifyLineItemProperty) => prop.name === "_bundle_id",
        ),
    );
}

function getBundleId(item: ShopifyLineItem): string | undefined {
    return item.properties?.find(
        (p: ShopifyLineItemProperty) => p.name === "_bundle_id",
    )?.value;
}

function calculateLineRevenue(item: ShopifyLineItem): number {
    // item.price is unit price; discount_allocations.amount is the TOTAL
    // discount applied to the line (already accounts for quantity).
    // Compute gross then subtract — clamp at 0 to guard against allocator
    // edge cases where discount > gross (rounding, multi-line allocation).
    const unitPrice = parseFloat(item.price);
    const quantity = item.quantity;
    const gross = unitPrice * quantity;

    const allocations = (item as { discount_allocations?: { amount: string }[] })
        .discount_allocations;
    const totalDiscount =
        allocations?.reduce((sum, a) => sum + parseFloat(a.amount), 0) ?? 0;

    return Math.max(0, gross - totalDiscount);
}

function aggregateByBundle(
    bundleItems: ShopifyLineItem[],
): Map<string, BundleAggregation> {
    const bundlesMap = new Map<string, BundleAggregation>();

    for (const item of bundleItems) {
        const bundleId = getBundleId(item);
        if (!bundleId) continue;

        const itemRevenue = calculateLineRevenue(item);
        const existing = bundlesMap.get(bundleId);

        if (existing) {
            existing.items.push(item);
            existing.totalRevenue += itemRevenue;
        } else {
            bundlesMap.set(bundleId, {
                items: [item],
                totalRevenue: itemRevenue,
            });
        }
    }

    return bundlesMap;
}

function detectNewCustomer(order: ShopifyOrder): boolean {
    if (!order.customer) return false;

    if (typeof order.customer.orders_count === "number") {
        return order.customer.orders_count === 1;
    }

    if (order.customer.created_at) {
        const customerCreated = new Date(order.customer.created_at);
        const orderCreated = new Date(order.created_at);
        const fiveMinutes = 5 * 60 * 1000;
        return orderCreated.getTime() - customerCreated.getTime() < fiveMinutes;
    }

    return false;
}

/**
 * Process an orders/create webhook payload.
 *
 * Returns true if processed, false if skipped due to dedup or no bundle items.
 */
export async function processOrderCreated(
    shop: string,
    order: ShopifyOrder,
): Promise<boolean> {
    const claimed = await claimOrderDelivery(shop, order.id);
    if (!claimed) return false;

    const bundleItems = order.line_items.filter(isBundleLineItem);
    if (bundleItems.length === 0) return false;

    const bundlesMap = aggregateByBundle(bundleItems);
    const isNewCustomer = detectNewCustomer(order);

    for (const [bundleId, bundleData] of bundlesMap.entries()) {
        await trackBundlePurchase({
            bundleId,
            revenue: bundleData.totalRevenue,
            customerId: order.customer?.id?.toString(),
            isNewCustomer,
            timestamp: new Date(order.created_at),
        });
    }

    return true;
}
