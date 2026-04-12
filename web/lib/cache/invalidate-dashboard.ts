/**
 * Dashboard cache invalidation helpers.
 *
 * Next.js 16 has two invalidation APIs:
 *   - updateTag(tag)       → immediate hard invalidation for "use cache" entries.
 *                             Only available in Server Actions.
 *   - revalidateTag(tag)   → works for unstable_cache entries.
 *                             Single-arg form is deprecated for "use cache" in v16.
 *
 * Analytics and setup-guide caches use "use cache" + cacheTag() → updateTag.
 * Product and widget-status caches use unstable_cache + tags option → revalidateTag.
 */

import { revalidateTag, updateTag } from "next/cache";
import { cacheTags } from "./cache-tags";

/**
 * Invalidate all analytics-related caches for a shop.
 * Call from Server Actions after bundle create/update/delete/status-change.
 * Uses updateTag because analytics caches use "use cache" + cacheTag().
 */
export function invalidateDashboardCache(shop: string) {
    for (const tag of cacheTags.allAnalytics(shop)) {
        updateTag(tag);
    }
}

/**
 * Invalidate setup guide cache for a shop.
 * Call from Server Actions after setup step updates or guide dismiss/show.
 * Uses updateTag because setup-guide.cached.ts uses "use cache" + cacheTag().
 */
export function invalidateSetupGuideCache(shop: string) {
    updateTag(cacheTags.setupGuide(shop));
}

/**
 * Invalidate cached Shopify product data for a shop.
 * Call from webhook handlers (PRODUCTS_UPDATE/CREATE/DELETE).
 * Uses revalidateTag because products.operations.ts uses unstable_cache.
 */
export function invalidateProductCache(shop: string) {
    revalidateTag(cacheTags.shopifyProducts(shop), "max");
}

/**
 * Invalidate cached widget block status for a shop.
 * Call when the user explicitly clicks "Verify" in the setup guide.
 * Uses revalidateTag because widget-block-status.action.ts uses unstable_cache.
 */
export function invalidateWidgetBlockCache(shop: string) {
    revalidateTag(cacheTags.widgetBlockStatus(shop), "max");
}
