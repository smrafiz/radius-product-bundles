/**
 * Cached Setup Guide Service
 *
 * Uses Next.js 16 `use cache` directive for persistent caching.
 * Called from the setup guide server action (which handles auth).
 */

import { cacheLife, cacheTag } from "next/cache";
import { getSetupGuideService } from "@/features/dashboard/services/setup-guide.service";

/**
 * Cached: setup guide progress
 * Profile: "dashboard-long" — 10 min stale, 10 min revalidate
 */
export async function getCachedSetupGuide(shop: string) {
    "use cache";
    cacheLife("dashboard-long");
    cacheTag(`setup-guide-${shop}`);

    return getSetupGuideService({ shop });
}
