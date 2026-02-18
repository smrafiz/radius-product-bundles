/**
 * Cached Analytics Services
 *
 * Uses Next.js 16 `use cache` directive with cacheLife and cacheTag
 * for persistent server-side caching on Vercel.
 *
 * These functions are called from server actions (which handle auth).
 * They MUST NOT be in a "use server" file.
 */

import { cacheLife, cacheTag } from "next/cache";
import {
    getAnalyticsMetrics,
    getChartData,
} from "@/features/analytics/services/analytics.service";
import { getTopBundlesService } from "@/features/analytics/services/bundle-analytics.service";
import {
    getAllBundlesAnalytics,
    getPaginatedBundlesAnalytics,
} from "@/features/analytics/services/bundle-analytics.service";
import type {
    PaginatedBundlesServiceParams,
    SortField,
    SortOrder,
} from "@/features/analytics";

/**
 * Cached: analytics metrics (dashboard cards)
 * Profile: "dashboard" — 5 min stale, 5 min revalidate
 */
export async function getCachedAnalyticsMetrics(
    shop: string,
    days: number,
    startDate?: string,
    endDate?: string,
) {
    "use cache";
    cacheLife("dashboard");
    cacheTag(`analytics-metrics-${shop}`);

    return getAnalyticsMetrics(shop, days, startDate, endDate);
}

/**
 * Cached: chart time-series data
 * Profile: "dashboard" — 5 min stale, 5 min revalidate
 */
export async function getCachedChartData(
    shop: string,
    days: number,
    startDate?: string,
    endDate?: string,
) {
    "use cache";
    cacheLife("dashboard");
    cacheTag(`chart-data-${shop}`);

    return getChartData(shop, days, startDate, endDate);
}

/**
 * Cached: top performing bundles
 * Profile: "dashboard-long" — 10 min stale, 10 min revalidate
 */
export async function getCachedTopBundles(
    shop: string,
    startDate: string,
    endDate: string,
    limit: number,
) {
    "use cache";
    cacheLife("dashboard-long");
    cacheTag(`top-bundles-${shop}`);

    return getTopBundlesService(shop, startDate, endDate, limit);
}

/**
 * Cached: all bundles with analytics (analytics page, non-paginated)
 * Profile: "dashboard" — 5 min stale, 5 min revalidate
 */
export async function getCachedAllBundlesAnalytics(
    shop: string,
    startDate: string,
    endDate: string,
    sortBy: SortField,
    sortOrder: SortOrder,
) {
    "use cache";
    cacheLife("dashboard");
    cacheTag(`analytics-metrics-${shop}`);

    return getAllBundlesAnalytics(shop, startDate, endDate, sortBy, sortOrder);
}

/**
 * Cached: paginated bundles with analytics (analytics page)
 * Profile: "dashboard" — 5 min stale, 5 min revalidate
 */
export async function getCachedPaginatedBundlesAnalytics(
    params: PaginatedBundlesServiceParams,
) {
    "use cache";
    cacheLife("dashboard");
    cacheTag(`analytics-metrics-${params.shop}`);

    return getPaginatedBundlesAnalytics(params);
}
