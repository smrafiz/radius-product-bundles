import { invalidateLocaleCacheService } from "@/features/settings/services/locale.service";

/**
 * Handle LOCALES_CREATE and LOCALES_UPDATE webhooks
 *
 * Invalidates the cached Shop.locales so the next page load re-fetches
 * fresh locale data from the Shopify Admin API.
 */
export async function handleLocalesUpdate(shop: string): Promise<void> {
    try {
        await invalidateLocaleCacheService(shop);
    } catch (error) {
        console.error("[Locales Handler] ❌ Error invalidating locale cache:", error);
    }
}
