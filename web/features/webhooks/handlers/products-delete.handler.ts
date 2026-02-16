import { clearMainProductByGid } from "@/features/bundles/repositories";

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

        if (clearedCount > 0) {
            console.log(
                `[Products Delete] Cleared mainProductId from ${clearedCount} bundle(s) for ${gid}`,
            );
        }
    } catch (error) {
        console.error("[Products Delete] Error:", error);
    }
}
