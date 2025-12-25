"use client";

/**
 * Analytics Hook
 *
 * Fetches analytics data using TanStack Query.
 * No Zustand store needed - TanStack Query handles caching.
 */

import { useQuery } from "@tanstack/react-query";
import { analyticsQueries } from "@/features/analytics";
import { useAppBridge } from "@shopify/app-bridge-react";

/**
 * Hook to fetch analytics data
 */
export function useAnalytics(days: number = 30) {
    const app = useAppBridge();
    const queries = analyticsQueries(app);

    const metricsQuery = useQuery(queries.metrics(days));
    const bundlesQuery = useQuery(queries.bundles(days));
    const chartQuery = useQuery(queries.chart(days));

    return {
        // Data
        metrics: metricsQuery.data,
        bundles: bundlesQuery.data,
        chartData: chartQuery.data,

        // Loading states
        isLoading:
            metricsQuery.isLoading ||
            bundlesQuery.isLoading ||
            chartQuery.isLoading,
        isMetricsLoading: metricsQuery.isLoading,
        isBundlesLoading: bundlesQuery.isLoading,
        isChartLoading: chartQuery.isLoading,

        // Fetching states (refetch in progress)
        isFetching:
            metricsQuery.isFetching ||
            bundlesQuery.isFetching ||
            chartQuery.isFetching,
        isMetricsFetching: metricsQuery.isFetching,

        // Error states
        error: metricsQuery.error || bundlesQuery.error || chartQuery.error,
        metricsError: metricsQuery.error,
        bundlesError: bundlesQuery.error,
        chartError: chartQuery.error,

        // Refetch functions
        refetchAll: () => {
            void metricsQuery.refetch();
            void bundlesQuery.refetch();
            void chartQuery.refetch();
        },
        refetchMetrics: metricsQuery.refetch,
        refetchBundles: bundlesQuery.refetch,
        refetchChart: chartQuery.refetch,
    };
}

/**
 * Hook to fetch only metrics (lighter weight)
 */
export function useAnalyticsMetrics(days: number = 30) {
    const app = useAppBridge();
    const queries = analyticsQueries(app);

    const metricsQuery = useQuery(queries.metrics(days));

    return {
        metrics: metricsQuery.data,
        isLoading: metricsQuery.isLoading,
        isFetching: metricsQuery.isFetching,
        error: metricsQuery.error,
        refetch: metricsQuery.refetch,
    };
}
