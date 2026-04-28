import { ShopifyOrder } from "@/shared";
import { processOrderCreated } from "@/features/webhooks/services";

/**
 * Handle ORDERS_CREATE webhook
 *
 * Thin handler — parses the payload and delegates to the service layer.
 */
export async function handleOrdersCreate(
    shop: string,
    body: string,
): Promise<void> {
    try {
        const order: ShopifyOrder = JSON.parse(body);
        await processOrderCreated(shop, order);
    } catch (error) {
        console.error(`[Orders Handler] ❌ Error:`, error);
    }
}
