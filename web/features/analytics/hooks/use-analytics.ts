"use client";

/**
 * Analytics Hook
 * Uses custom DB for all analytics data (bundle-specific views, carts, purchases)
 * ShopifyQL code is available but not used (ready for AI features)
 */

import { analyticsQueries } from "@/features/analytics";
import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAppBridge } from "@shopify/app-bridge-react";
import { useAnalyticsStore } from "@/features/analytics";
import type { ChartDataPoint } from "@/features/analytics";

/**
 * Hook to fetch analytics data (metrics and chart)
 * Uses custom DB for all data
 */
export function useAnalytics() {
    const app = useAppBridge();
    const { days, startDate, endDate } = useAnalyticsStore();

    const queries = analyticsQueries(app);
    const bundleMetricsQueryOptions = queries.metrics(days, startDate, endDate);
    const chartQueryOptions = queries.chart(days, startDate, endDate);

    const bundleMetricsQuery = useQuery(bundleMetricsQueryOptions);
    const chartQuery = useQuery(chartQueryOptions);

    const metrics = useMemo(() => {
        const bundleData = bundleMetricsQuery.data;

        return {
            totals: {
                revenue: bundleData?.totals?.revenue ?? 0,
                views: bundleData?.totals?.views ?? 0,
                purchases: bundleData?.totals?.purchases ?? 0,
                addToCarts: bundleData?.totals?.addToCarts ?? 0,
                activeBundles: bundleData?.totals?.activeBundles ?? 0,
                totalBundles: bundleData?.totals?.totalBundles ?? 0,
                revenueAllTime: bundleData?.totals?.revenueAllTime ?? 0,
            },
            metrics: {
                conversionRate: bundleData?.metrics?.conversionRate ?? 0,
                avgOrderValue: bundleData?.metrics?.avgOrderValue ?? 0,
                cartConversionRate:
                    bundleData?.metrics?.cartConversionRate ?? 0,
            },
            growth: {
                revenue: bundleData?.growth?.revenue ?? 0,
                conversion: bundleData?.growth?.conversion ?? 0,
            },
        };
    }, [bundleMetricsQuery.data]);

    const chartData = useMemo<ChartDataPoint[]>(() => {
        const data = chartQuery.data ?? [];
        return data.map((item: ChartDataPoint) => ({
            date: item.date,
            views: item.views ?? 0,
            addToCarts: item.addToCarts ?? 0,
            purchases: item.purchases ?? 0,
            revenue: item.revenue ?? 0,
        }));
    }, [chartQuery.data]);

    return {
        metrics,
        chartData,
        isLoading: bundleMetricsQuery.isLoading || chartQuery.isLoading,
        isMetricsLoading: bundleMetricsQuery.isLoading,
        isChartLoading: chartQuery.isLoading,
        isFetching: bundleMetricsQuery.isFetching || chartQuery.isFetching,
        isMetricsFetching: bundleMetricsQuery.isFetching,
        isChartFetching: chartQuery.isFetching,
        error: bundleMetricsQuery.error || chartQuery.error,
        metricsError: bundleMetricsQuery.error,
        chartError: chartQuery.error,
        refetchAll: () => {
            void bundleMetricsQuery.refetch();
            void chartQuery.refetch();
        },
        refetchMetrics: () => {
            void bundleMetricsQuery.refetch();
        },
        refetchChart: chartQuery.refetch,
    };
}

/**
 * Hook to fetch only metrics (lighter weight)
 * Uses custom DB for all data
 */
export function useAnalyticsMetrics(overrideDays?: number) {
    const app = useAppBridge();
    const {
        days: storeDays,
        startDate: storeStart,
        endDate: storeEnd,
    } = useAnalyticsStore();

    const isOverridden = overrideDays !== undefined;
    const days = overrideDays ?? storeDays;

    const queries = analyticsQueries(app);
    const bundleMetricsQuery = useQuery({
        ...queries.metrics(days, storeStart, storeEnd),
        staleTime: 10 * 60 * 1000,
    });

    const metrics = useMemo(() => {
        const bundleData = bundleMetricsQuery.data;

        return {
            totals: {
                revenue: bundleData?.totals?.revenue ?? 0,
                views: bundleData?.totals?.views ?? 0,
                purchases: bundleData?.totals?.purchases ?? 0,
                addToCarts: bundleData?.totals?.addToCarts ?? 0,
                activeBundles: bundleData?.totals?.activeBundles ?? 0,
                totalBundles: bundleData?.totals?.totalBundles ?? 0,
                revenueAllTime: bundleData?.totals?.revenueAllTime ?? 0,
            },
            metrics: {
                conversionRate: bundleData?.metrics?.conversionRate ?? 0,
                avgOrderValue: bundleData?.metrics?.avgOrderValue ?? 0,
                cartConversionRate:
                    bundleData?.metrics?.cartConversionRate ?? 0,
            },
            growth: {
                revenue: bundleData?.growth?.revenue ?? 0,
                conversion: bundleData?.growth?.conversion ?? 0,
            },
        };
    }, [bundleMetricsQuery.data]);

    return {
        metrics,
        isLoading: bundleMetricsQuery.isLoading,
        isFetching: bundleMetricsQuery.isFetching,
        error: bundleMetricsQuery.error,
        refetch: () => {
            void bundleMetricsQuery.refetch();
        },
        days,
        startDate: storeStart,
        endDate: storeEnd,
    };
}
