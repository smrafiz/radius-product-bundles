import { invalidateProductCache } from "@/lib/cache";

/**
 * Handle PRODUCTS_UPDATE webhook.
 *
 * Busts the server-side Shopify product cache for this shop so that
 * the next bundle list request fetches updated titles, images, prices,
 * and variant data rather than serving stale cached values.
 */
export async function handleProductsUpdate(
    shop: string,
    body: string,
): Promise<void> {
    try {
        invalidateProductCache(shop);
    } catch (error) {
        console.error("[Products Update] Error:", error);
    }
}
