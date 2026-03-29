import { ShopifyShop } from "@/shared";

/**
 * Handle SHOP_UPDATE webhook
 *
 * Sync shop settings when updated
 */
export async function handleShopUpdate(
    shop: string,
    body: string,
): Promise<void> {
    try {
        const shopData: ShopifyShop = JSON.parse(body);

        // Dispatch event for client-side listeners
        if (typeof window !== "undefined") {
            window.dispatchEvent(
                new CustomEvent("radius-shop-settings-changed", {
                    detail: shopData,
                }),
            );
        }

    } catch (error) {
        console.error("[Shop Update Handler] ❌ Error:", error);
    }
}
