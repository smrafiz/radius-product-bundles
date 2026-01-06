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

        console.log("[Shop Update Handler] Processing update:", {
            shop,
            currency: shopData.currency,
            countryCode: shopData.country_code,
        });

        // Dispatch event for client-side listeners
        if (typeof window !== "undefined") {
            window.dispatchEvent(
                new CustomEvent("radius-shop-settings-changed", {
                    detail: shopData,
                }),
            );
        }

        console.log("[Shop Update Handler] ✅ Update processed");
    } catch (error) {
        console.error("[Shop Update Handler] ❌ Error:", error);
    }
}
