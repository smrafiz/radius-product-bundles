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

    } catch (error) {
        console.error("[Products Delete] Error:", error);
    }
}
