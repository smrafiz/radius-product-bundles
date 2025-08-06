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