import { getAnalyticsMetricsAction, getChartDataAction, } from "@/features/analytics/actions";
import { useAppBridge } from "@shopify/app-bridge-react";
import { analyticsQueryKeys, ChartDataPoint } from "@/features/analytics";

/**
 * Analytics queries for TanStack Query
 */
export const analyticsQueries = (app: ReturnType<typeof useAppBridge>) => ({
    /**
     * Metrics query
     *
     * Fetches aggregate analytics metrics (revenue, views, conversions, etc.)
     */
    metrics: (days: number = 30, startDate?: string, endDate?: string) => ({
        queryKey: analyticsQueryKeys.metrics(days, startDate, endDate),
        queryFn: async () => {
            const token = await app.idToken();
            const result = await getAnalyticsMetricsAction(
                token,
                days,
                startDate,
                endDate,
            );

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
    chart: (days: number = 30, startDate?: string, endDate?: string) => ({
        queryKey: analyticsQueryKeys.chart(days, startDate, endDate),
        queryFn: async (): Promise<ChartDataPoint[]> => {
            const token = await app.idToken();
            const result = await getChartDataAction(
                token,
                days,
                startDate,
                endDate,
            );

            if (result.status === "error") {
                throw new Error(result.message);
            }

            return (result.data ?? []) as ChartDataPoint[];
        },
        staleTime: 2 * 60 * 1000,
        gcTime: 10 * 60 * 1000,
        refetchOnWindowFocus: false,
    }),
});
