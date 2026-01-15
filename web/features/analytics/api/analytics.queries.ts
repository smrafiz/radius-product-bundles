import { useAppBridge } from "@shopify/app-bridge-react";
import { analyticsQueryKeys, ChartDataPoint, TopBundle, } from "@/features/analytics";
import { getAnalyticsMetricsAction, getChartDataAction, getTopBundlesAction, } from "@/features/analytics/actions";

/**
 * Analytics queries for TanStack Query
 */
export const analyticsQueries = (app: ReturnType<typeof useAppBridge>) => ({
    /**
     * Metrics query
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

    /**
     * Top bundles query
     */
    topBundles: (startDate?: string, endDate?: string, limit: number = 10) => ({
        queryKey: analyticsQueryKeys.bundles.top(startDate, endDate, limit),
        queryFn: async (): Promise<TopBundle[]> => {
            const token = await app.idToken();

            if (!token || !startDate || !endDate) {
                throw new Error("Missing required parameters");
            }

            const result = await getTopBundlesAction(
                token,
                startDate,
                endDate,
                limit,
            );

            if (result.status === "error") {
                throw new Error(
                    result.message || "Failed to fetch top bundles",
                );
            }

            return result.data ?? [];
        },
        enabled: !!startDate && !!endDate,
        staleTime: 5 * 60 * 1000,
        gcTime: 10 * 60 * 1000,
        refetchOnWindowFocus: false,
    }),
});
