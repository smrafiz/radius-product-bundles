import {
    analyticsQueryKeys,
} from "@/features/analytics";
import {
    getAnalyticsMetricsAction,
    getBundleStatsAction,
    getChartDataAction,
} from "@/features/analytics/actions";
import { useAppBridge } from "@shopify/app-bridge-react";

/**
 * Analytics queries for TanStack Query
 */
export const analyticsQueries = (app: ReturnType<typeof useAppBridge>) => ({
    /**
     * Metrics query
     */
    metrics: (days: number = 30) => ({
        queryKey: analyticsQueryKeys.metrics(days),
        queryFn: async () => {
            const token = await app.idToken();
            const result = await getAnalyticsMetricsAction(token, days);

            if (result.status === "error") {
                throw new Error(result.message);
            }

            return result.data ?? {};
        },
        staleTime: 5 * 60 * 1000, // 5 minutes
        cacheTime: 10 * 60 * 1000, // 10 minutes
        refetchOnWindowFocus: false,
    }),

    /**
     * Bundle stats query
     */
    bundles: (days: number = 30) => ({
        queryKey: analyticsQueryKeys.bundles(days),
        queryFn: async () => {
            const token = await app.idToken();
            const result = await getBundleStatsAction(token, days);

            if (result.status === "error") {
                throw new Error(result.message);
            }

            return result.data ?? [];
        },
        staleTime: 5 * 60 * 1000,
        cacheTime: 10 * 60 * 1000,
        refetchOnWindowFocus: false,
    }),

    /**
     * Chart data query
     */
    chart: (days: number = 30) => ({
        queryKey: analyticsQueryKeys.chart(days),
        queryFn: async () => {
            const token = await app.idToken();
            const result = await getChartDataAction(token, days);

            if (result.status === "error") {
                throw new Error(result.message);
            }

            return result.data ?? [];
        },
        staleTime: 5 * 60 * 1000,
        cacheTime: 10 * 60 * 1000,
        refetchOnWindowFocus: false,
    }),
});
