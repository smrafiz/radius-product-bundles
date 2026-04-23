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

    /**
     * Shopify product data cache for a specific set of product IDs.
     * Keyed by shop so invalidation is scoped per-tenant.
     * Individual product updates bust the whole shop's product cache —
     * product sets are small enough that a full shop-scoped bust is fine.
     */
    shopifyProducts: (shop: string) => `shopify-products-${shop}`,

    /**
     * Shopify theme widget block status — result of scanning theme files.
     * Expensive (2-3 Shopify Admin API calls). Cached for 5 min.
     * Busted when the user explicitly clicks "Verify" in the setup guide.
     */
    widgetBlockStatus: (shop: string) => `widget-block-status-${shop}`,
} as const;

/** Revalidation durations in seconds */
export const cacheDurations = {
    /** 5 minutes - for metrics and chart data */
    metrics: 300,

    /** 10 minutes - for top bundles and setup guide */
    long: 600,

    /**
     * 1 hour - for Shopify product data.
     * Product data (title, image, variants, price) changes infrequently.
     * Webhook handlers (PRODUCTS_UPDATE/CREATE/DELETE) bust this tag on change
     * so the TTL is a safety net, not the primary freshness mechanism.
     */
    shopifyProducts: 3600,

    /**
     * 5 minutes - for widget block status.
     * Theme file scanning is expensive (2-3 Shopify API calls).
     * Short TTL so that after a merchant adds the block, the next check
     * reflects reality quickly.
     */
    widgetBlockStatus: 300,
} as const;
