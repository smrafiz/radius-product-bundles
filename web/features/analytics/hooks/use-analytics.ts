"use client";

/**
 * Analytics Hook
 */

import {
    analyticsQueries,
    formatDate,
    getTodayInShopTimezone,
} from "@/features/analytics";
import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
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
        staleTime: 10 * 60 * 1000, // 10 min (server-side cached for 5 min)
    });

    const chartQuery = useQuery({
        ...queries.chart(days, startDate, endDate),
        staleTime: 5 * 60 * 1000, // 5 min (server-side cached for 5 min)
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
 * When overrideDays is provided, computes its own date range independent of the store.
 */
export function useAnalyticsMetrics(overrideDays?: number) {
    const app = useAppBridge();
    const {
        days: storeDays,
        startDate: storeStart,
        endDate: storeEnd,
    } = useAnalyticsStore();
    const queries = analyticsQueries(app);

    const isOverridden = overrideDays !== undefined;
    const days = overrideDays ?? storeDays;

    // Compute fixed date range when overrideDays is provided
    const { startDate, endDate } = useMemo(() => {
        if (!isOverridden) return { startDate: storeStart, endDate: storeEnd };
        const today = getTodayInShopTimezone();
        const start = new Date(today);
        start.setDate(start.getDate() - (days - 1));
        return { startDate: formatDate(start), endDate: formatDate(today) };
    }, [isOverridden, days, storeStart, storeEnd]);

    const metricsQuery = useQuery({
        ...queries.metrics(days, startDate, endDate),
        staleTime: 10 * 60 * 1000, // 10 min (server-side cached for 5 min)
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
