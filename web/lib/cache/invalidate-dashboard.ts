/**
 * Dashboard cache invalidation helpers.
 *
 * Call these from server actions to bust stale dashboard caches.
 * Uses `revalidateTag` for on-demand invalidation.
 */

import { revalidateTag } from "next/cache";
import { cacheTags } from "./cache-tags";

/**
 * Invalidate all analytics-related caches for a shop.
 * Call after bundle create/update/delete/status-change.
 */
export function invalidateDashboardCache(shop: string) {
    for (const tag of cacheTags.allAnalytics(shop)) {
        revalidateTag(tag);
    }
}

/**
 * Invalidate setup guide cache for a shop.
 * Call after setup step updates or guide dismiss/show.
 */
export function invalidateSetupGuideCache(shop: string) {
    revalidateTag(cacheTags.setupGuide(shop));
}

/**
 * Invalidate cached Shopify product data for a shop.
 * Call from PRODUCTS_UPDATE, PRODUCTS_CREATE, and PRODUCTS_DELETE webhook handlers
 * so the next bundle list request fetches fresh product titles, images, and prices.
 */
export function invalidateProductCache(shop: string) {
    revalidateTag(cacheTags.shopifyProducts(shop));
}

/**
 * Invalidate cached widget block status for a shop.
 * Call when the user explicitly clicks "Verify" in the setup guide so the
 * next check re-scans the theme rather than serving a cached result.
 */
export function invalidateWidgetBlockCache(shop: string) {
    revalidateTag(cacheTags.widgetBlockStatus(shop));
}
