import { clearMainProductByGid } from "@/features/bundles/repositories";
import { invalidateProductCache } from "@/lib/cache";

export async function handleProductsDelete(
    shop: string,
    body: string,
): Promise<void> {
    try {
        const data = JSON.parse(body);
        const numericId = data.id;

        if (!numericId) {
            console.warn("[Products Delete] No product ID in payload");
            return;
        }

        const gid = `gid://shopify/Product/${numericId}`;
        const clearedCount = await clearMainProductByGid(shop, gid);

        // Bust cached Shopify product data so the next bundle list
        // request reflects the deleted product immediately.
        invalidateProductCache(shop);
    } catch (error) {
        console.error("[Products Delete] Error:", error);
    }
}
