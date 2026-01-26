"use client";

/**
 * Analytics Hook
 */

import { useQuery } from "@tanstack/react-query";
import { analyticsQueries } from "@/features/analytics";
import { useAppBridge } from "@shopify/app-bridge-react";
import { useAnalyticsStore } from "@/features/analytics";

/**
 * Hook to fetch analytics data (metrics and chart only)
 */
export function useAnalytics() {
    const app = useAppBridge();
    const { days, startDate, endDate } = useAnalyticsStore();
    const queries = analyticsQueries(app);

    const metricsQuery = useQuery({
        ...queries.metrics(days, startDate, endDate),
        staleTime: 2 * 60 * 1000,
        gcTime: 10 * 60 * 1000,
        refetchOnWindowFocus: false,
    });

    const chartQuery = useQuery({
        ...queries.chart(days, startDate, endDate),
        staleTime: 2 * 60 * 1000,
        gcTime: 10 * 60 * 1000,
        refetchOnWindowFocus: false,
    });

    return {
        // Data
        metrics: metricsQuery.data,
        chartData: chartQuery.data,

        // Loading states
        isLoading: metricsQuery.isLoading || chartQuery.isLoading,
        isMetricsLoading: metricsQuery.isLoading,
        isChartLoading: chartQuery.isLoading,

        // Fetching states (refetch in progress)
        isFetching: metricsQuery.isFetching || chartQuery.isFetching,
        isMetricsFetching: metricsQuery.isFetching,
        isChartFetching: chartQuery.isFetching,

        // Error states
        error: metricsQuery.error || chartQuery.error,
        metricsError: metricsQuery.error,
        chartError: chartQuery.error,

        // Refetch functions
        refetchAll: () => {
            void metricsQuery.refetch();
            void chartQuery.refetch();
        },
        refetchMetrics: metricsQuery.refetch,
        refetchChart: chartQuery.refetch,
    };
}

/**
 * Hook to fetch only metrics (lighter weight)
 */
export function useAnalyticsMetrics(overrideDays?: number) {
    const app = useAppBridge();
    const { days: storeDays, startDate, endDate } = useAnalyticsStore();
    const queries = analyticsQueries(app);

    const days = overrideDays ?? storeDays;

    const metricsQuery = useQuery({
        ...queries.metrics(days, startDate, endDate),
        staleTime: 2 * 60 * 1000,
        gcTime: 10 * 60 * 1000,
        refetchOnWindowFocus: false,
    });

    return {
        metrics: metricsQuery.data,
        isLoading: metricsQuery.isLoading,
        isFetching: metricsQuery.isFetching,
        error: metricsQuery.error,
        refetch: metricsQuery.refetch,
        days,
        startDate,
        endDate,
    };
}
