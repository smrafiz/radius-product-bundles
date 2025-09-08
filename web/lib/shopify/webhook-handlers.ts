export async function handleProductUpdate(shop: string, rawBody: string) {
    try {
        const product = JSON.parse(rawBody);

        if (!product.variants || product.variants.length === 0) {
            return;
        }
    } catch (error) {
        console.error("Error handling product update webhook:", error);
    }
}

export async function handleShopUpdate(shop: string, body: string) {
    try {
        const shopData = JSON.parse(body);
        console.log("Shop update received:", {
            shop,
            currency: shopData.currency,
            countryCode: shopData.country_code,
        });

        // Trigger client refresh
        if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('radius-shop-settings-changed'));
        }

    } catch (error) {
        console.error("Failed to handle shop update webhook:", error);
    }
}