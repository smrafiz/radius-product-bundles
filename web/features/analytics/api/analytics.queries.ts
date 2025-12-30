import { analyticsQueryKeys } from "@/features/analytics";
import {
    getAnalyticsMetricsAction,
    getChartDataAction,
} from "@/features/analytics/actions";
import { useAppBridge } from "@shopify/app-bridge-react";

/**
 * Analytics queries for TanStack Query
 */
export const analyticsQueries = (app: ReturnType<typeof useAppBridge>) => ({
    /**
     * Metrics query
     *
     * Fetches aggregate analytics metrics (revenue, views, conversions, etc.)
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
        staleTime: 2 * 60 * 1000,
        gcTime: 10 * 60 * 1000,
        refetchOnWindowFocus: false,
    }),

    /**
     * Chart data query
     *
     * Fetches time-series data for analytics charts.
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
        staleTime: 2 * 60 * 1000,
        gcTime: 10 * 60 * 1000,
        refetchOnWindowFocus: false,
    }),
});
