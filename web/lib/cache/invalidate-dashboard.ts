/**
 * Dashboard cache invalidation helpers.
 *
 * Call these from server actions to bust stale dashboard caches.
 * Uses `updateTag` for read-your-own-writes semantics — the response
 * from the same server action will already reflect the fresh data.
 */

import { updateTag } from "next/cache";
import { cacheTags } from "./cache-tags";

/**
 * Invalidate all analytics-related caches for a shop.
 * Call after bundle create/update/delete/status-change.
 */
export function invalidateDashboardCache(shop: string) {
    for (const tag of cacheTags.allAnalytics(shop)) {
        updateTag(tag);
    }
}

/**
 * Invalidate setup guide cache for a shop.
 * Call after setup step updates or guide dismiss/show.
 */
export function invalidateSetupGuideCache(shop: string) {
    updateTag(cacheTags.setupGuide(shop));
}
