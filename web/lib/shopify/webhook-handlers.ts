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
        console.log(shop, body);

        console.log("Shop update received:", {
            shop,
            currency: shopData.currency,
            countryCode: shopData.country_code,
            name: shopData.name
        });

        // Invalidate shop settings cache
        await invalidateShopSettingsCache(shop, {
            currencyCode: shopData.currency,
            countryCode: shopData.country_code
        });

    } catch (error) {
        console.error("Failed to handle shop update webhook:", error);
    }
}

async function invalidateShopSettingsCache(shop: string, changes: { currencyCode?: string; countryCode?: string }) {
    // Store invalidation signal for client polling
    if (typeof global !== 'undefined') {
        global.shopCacheInvalidations = global.shopCacheInvalidations || new Map();
        global.shopCacheInvalidations.set(shop, {
            invalidatedAt: Date.now(),
            changes,
            type: 'shop_update'
        });

        console.log(`Shop settings cache invalidated for ${shop}:`, changes);
    }
}