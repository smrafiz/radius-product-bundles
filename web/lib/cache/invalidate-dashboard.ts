/**
 * Dashboard cache invalidation helpers.
 *
 * Call these in mutation actions to bust stale dashboard caches.
 * Uses { expire: 0 } for immediate expiration so the next request
 * fetches fresh data after a mutation.
 */

import { revalidateTag } from "next/cache";
import { cacheTags } from "./cache-tags";

/**
 * Invalidate all analytics-related caches for a shop.
 * Call after bundle create/update/delete/status-change.
 */
export function invalidateDashboardCache(shop: string) {
    for (const tag of cacheTags.allAnalytics(shop)) {
        revalidateTag(tag, { expire: 0 });
    }
}

/**
 * Invalidate setup guide cache for a shop.
 * Call after setup step updates or guide dismiss/show.
 */
export function invalidateSetupGuideCache(shop: string) {
    revalidateTag(cacheTags.setupGuide(shop), { expire: 0 });
}
