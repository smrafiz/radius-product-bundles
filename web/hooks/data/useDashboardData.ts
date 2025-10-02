"use client";

import { useEffect } from "react";
import { useQueries } from "@tanstack/react-query";
import { useAppBridge } from "@shopify/app-bridge-react";

import { useDashboardStore } from "@/stores";
import { getBundleMetrics, getBundles } from "@/actions";

export const useDashboardData = () => {
    const app = useAppBridge();
    const { setBundles, setMetrics, setLoading, setError, showToast } =
        useDashboardStore();

    const [bundlesQuery, metricsQuery] = useQueries({
        queries: [
            {
                queryKey: ["bundles"],
                queryFn: async () => {
                    const token = await app.idToken();
                    const result = await getBundles(token);
                    if (result.status === "error") throw new Error(result.message);
                    return result.data ?? [];
                },
            },
            {
                queryKey: ["bundle-metrics"],
                queryFn: async () => {
                    const token = await app.idToken();
                    const result = await getBundleMetrics(token);
                    if (result.status === "error") throw new Error(result.message);
                    return result.data;
                },
            },
        ],
    });

    // Sync loading
    useEffect(() => {
        setLoading(bundlesQuery.isLoading || metricsQuery.isLoading || metricsQuery.isFetching);
    }, [bundlesQuery.isLoading, metricsQuery.isLoading, metricsQuery.isFetching, setLoading]);

    // Handle bundles
    useEffect(() => {
        if (bundlesQuery.isSuccess) {
            setBundles(bundlesQuery.data);
        } else if (bundlesQuery.isError) {
            const message =
                (bundlesQuery.error as Error)?.message || "Failed to load bundles";
            setError(message);
            showToast(message);
            setBundles([]);
        }
    }, [bundlesQuery.status, bundlesQuery.data, bundlesQuery.error, setBundles, setError, showToast]);

    // Handle metrics - still update store for other components
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

    // Return metrics directly from query, not from store
    const currentMetrics = metricsQuery.isFetching ? null : (
        metricsQuery.data ? {
            totalRevenue: metricsQuery.data?.totals?.revenue || 0,
            revenueAllTime: metricsQuery.data?.totals?.revenueAllTime || 0,
            totalViews: metricsQuery.data?.totals?.views || 0,
            avgConversionRate: metricsQuery.data?.metrics?.conversionRate || 0,
            totalBundles: metricsQuery.data?.totals?.totalBundles || 0,
            activeBundles: metricsQuery.data?.totals?.activeBundles || 0,
            revenueGrowth: metricsQuery.data?.growth?.revenue || 0,
            conversionGrowth: metricsQuery.data?.growth?.conversion || 0,
        } : null
    );

    return {
        bundlesQuery,
        metricsQuery,
        metrics: currentMetrics, // Return directly
        isMetricsFetching: metricsQuery.isFetching,
    };
};
