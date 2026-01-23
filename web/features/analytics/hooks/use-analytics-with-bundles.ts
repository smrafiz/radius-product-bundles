"use client";

import { useMemo } from "react";
import { useAnalytics } from "@/features/analytics";
import { useBundlesData } from "@/features/bundles";

/**
 * Hook to fetch analytics with enriched bundle data
 */
export function useAnalyticsWithBundles() {
    const analytics = useAnalytics();
    const {
        bundles: fullBundles,
        isLoading: isBundlesLoading,
        isFetching: isBundlesFetching,
        error: bundlesError,
    } = useBundlesData();

    /**
     * Merge analytics stats with full bundle data
     */
    const enrichedBundles = useMemo(() => {
        if (!fullBundles || fullBundles.length === 0) {
            return [];
        }

        // Sort bundles by revenue (descending)
        return [...fullBundles]
            .map((bundle) => ({
                // Bundle identity
                id: bundle.id,
                bundleId: bundle.id,
                name: bundle.name,

                // Bundle details
                status: bundle.status,
                type: bundle.type,
                discountType: bundle.discountType,
                discountValue: bundle.discountValue,

                // Analytics stats (from bundle object itself)
                views: bundle.views || 0,
                conversions: bundle.conversions || 0,
                revenue: bundle.revenue || 0,
                revenueAllTime: bundle.revenueAllTime || 0,
                conversionRate: bundle.conversionRate || 0,

                // Product information
                products: bundle.products || [],
                productCount: bundle.productCount || 0,

                // Timestamps
                createdAt: bundle.createdAt,
            }))
            .sort((a, b) => b.revenue - a.revenue); // Sort by revenue descending
    }, [fullBundles]);

    return {
        // Analytics data
        metrics: analytics.metrics,
        chartData: analytics.chartData,

        // Enriched bundles with products
        bundles: enrichedBundles,

        // Loading states
        isLoading: analytics.isLoading || isBundlesLoading,
        isAnalyticsLoading: analytics.isLoading,
        isBundlesLoading,

        // Fetching states
        isFetching: analytics.isFetching || isBundlesFetching,
        isAnalyticsFetching: analytics.isFetching,
        isBundlesFetching,

        // Errors
        error: analytics.error || bundlesError,
        analyticsError: analytics.error,
        bundlesError,

        // Refetch functions
        refetchAll: () => {
            analytics.refetchAll();
        },
        refetchAnalytics: analytics.refetchAll,
    };
}
