"use client";

import { useEffect } from "react";
import { useQueries } from "@tanstack/react-query";
import { useAppBridge } from "@shopify/app-bridge-react";

import { dashboardQueries, useDashboardStore } from "@/features/dashboard";
import { useGlobalBannerStore } from "@/shared";

export const useDashboardData = () => {
    const app = useAppBridge();
    const { addMessage } = useGlobalBannerStore();
    const { setBundles, setMetrics, setLoading } = useDashboardStore();

    const { bundles, metrics } = dashboardQueries(app);

    const [bundlesQuery, metricsQuery] = useQueries({
        queries: [bundles, metrics],
    });

    // Sync loading
    useEffect(() => {
        setLoading(
            bundlesQuery.isLoading ||
                metricsQuery.isLoading ||
                metricsQuery.isFetching,
        );
    }, [
        bundlesQuery.isLoading,
        metricsQuery.isLoading,
        metricsQuery.isFetching,
        setLoading,
    ]);

    // Handle bundles
    useEffect(() => {
        if (bundlesQuery.isError) {
            const message =
                (bundlesQuery.error as Error)?.message ||
                "Failed to load bundles";
            addMessage({
                type: "error",
                title: "Error loading bundles",
                content: message,
            });
            setBundles([]);
        } else if (bundlesQuery.isSuccess) {
            setBundles(bundlesQuery.data);
        }
    }, [
        bundlesQuery.status,
        bundlesQuery.data,
        bundlesQuery.error,
        setBundles,
    ]);

    // Handle metrics - still update the store for other components
    useEffect(() => {
        if (metricsQuery.isSuccess) {
            const d = metricsQuery.data ?? {};
            setMetrics({
                totalRevenue: d?.totals?.revenue || 0,
                revenueAllTime: d?.totals?.revenueAllTime || 0,
                totalViews: d?.totals?.views || 0,
                avgConversionRate: d?.metrics?.conversionRate || 0,
                totalBundles: d?.totals?.totalBundles || 0,
                activeBundles: d?.totals?.activeBundles || 0,
                revenueGrowth: d?.growth?.revenue || 0,
                conversionGrowth: d?.growth?.conversion || 0,
            });
        } else if (metricsQuery.isError) {
            setMetrics({
                totalRevenue: 0,
                revenueAllTime: 0,
                totalViews: 0,
                avgConversionRate: 0,
                totalBundles: 0,
                activeBundles: 0,
                revenueGrowth: 0,
                conversionGrowth: 0,
            });
        }
    }, [metricsQuery.status, metricsQuery.data, setMetrics]);

    // Return metrics directly from the query
    const currentMetrics = metricsQuery.isFetching
        ? null
        : metricsQuery.data
          ? {
                totalRevenue: metricsQuery.data?.totals?.revenue || 0,
                revenueAllTime: metricsQuery.data?.totals?.revenueAllTime || 0,
                totalViews: metricsQuery.data?.totals?.views || 0,
                avgConversionRate:
                    metricsQuery.data?.metrics?.conversionRate || 0,
                totalBundles: metricsQuery.data?.totals?.totalBundles || 0,
                activeBundles: metricsQuery.data?.totals?.activeBundles || 0,
                revenueGrowth: metricsQuery.data?.growth?.revenue || 0,
                conversionGrowth: metricsQuery.data?.growth?.conversion || 0,
            }
          : null;

    return {
        bundlesQuery,
        metricsQuery,
        metrics: currentMetrics,
        isMetricsFetching: metricsQuery.isFetching,
    };
};
