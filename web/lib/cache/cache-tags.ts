/**
 * Centralized cache tag definitions for unstable_cache invalidation.
 *
 * Tags are per-shop to avoid cross-tenant cache pollution.
 */

export const cacheTags = {
    /** Dashboard metrics (views, revenue, conversion, etc.) */
    analyticsMetrics: (shop: string) => `analytics-metrics-${shop}`,

    /** Top performing bundles */
    topBundles: (shop: string) => `top-bundles-${shop}`,

    /** Setup guide progress */
    setupGuide: (shop: string) => `setup-guide-${shop}`,

    /** Chart time-series data */
    chartData: (shop: string) => `chart-data-${shop}`,

    /** All analytics-related caches for a shop */
    allAnalytics: (shop: string) => [
        cacheTags.analyticsMetrics(shop),
        cacheTags.topBundles(shop),
        cacheTags.chartData(shop),
    ],
} as const;

/** Revalidation durations in seconds */
export const cacheDurations = {
    /** 5 minutes - for metrics and chart data */
    metrics: 300,

    /** 10 minutes - for top bundles and setup guide */
    long: 600,
} as const;
