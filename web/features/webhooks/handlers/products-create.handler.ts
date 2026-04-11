import { invalidateProductCache } from "@/lib/cache";

/**
 * Handle PRODUCTS_CREATE webhook.
 *
 * A newly created product won't be in any bundle yet, but invalidating
 * the product cache ensures that if it is immediately added to a bundle
 * (e.g. via automation), the next list request will see it.
 */
export async function handleProductsCreate(
    shop: string,
    body: string,
): Promise<void> {
    try {
        invalidateProductCache(shop);
    } catch (error) {
        console.error("[Products Create] Error:", error);
    }
}
