import { useAppBridge } from "@shopify/app-bridge-react";
import { useQuery } from "@tanstack/react-query";
import {
    AllBundlesData,
    analyticsQueryKeys,
    ChartDataPoint,
    PaginatedAllBundlesData,
    SortField,
    SortOrder,
    TopBundle,
} from "@/features/analytics";
import {
    getAllBundlesAction,
    getAnalyticsMetricsAction,
    getChartDataAction,
    getPaginatedBundlesAction,
    getTopBundlesAction,
} from "@/features/analytics/actions";
import type { DateRange } from "@/shared/types/services";

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

    /**
     * All bundles query (non-paginated)
     */
    allBundles: (
        startDate?: string,
        endDate?: string,
        sortBy: SortField = "revenue",
        sortOrder: SortOrder = "desc",
    ) => ({
        queryKey: analyticsQueryKeys.bundles.list(
            startDate,
            endDate,
            sortBy,
            sortOrder,
        ),
        queryFn: async (): Promise<AllBundlesData> => {
            const token = await app.idToken();

            if (!token || !startDate || !endDate) {
                throw new Error("Missing required parameters");
            }

            const result = await getAllBundlesAction(
                token,
                startDate,
                endDate,
                sortBy,
                sortOrder,
            );

            if (result.status === "error") {
                throw new Error(result.message || "Failed to fetch bundles");
            }

            return result.data as AllBundlesData;
        },
        enabled: !!startDate && !!endDate,
        staleTime: 5 * 60 * 1000,
        gcTime: 10 * 60 * 1000,
        refetchOnWindowFocus: false,
    }),

    /**
     * Paginated bundles query with search
     */
    paginatedBundles: (
        startDate?: string,
        endDate?: string,
        sortBy: SortField = "revenue",
        sortOrder: SortOrder = "desc",
        page: number = 1,
        perPage: number = 10,
        search: string = "",
    ) => ({
        queryKey: analyticsQueryKeys.bundles.paginated(
            startDate,
            endDate,
            sortBy,
            sortOrder,
            page,
            perPage,
            search,
        ),
        queryFn: async (): Promise<PaginatedAllBundlesData> => {
            const token = await app.idToken();

            if (!token || !startDate || !endDate) {
                throw new Error("Missing required parameters");
            }

            const result = await getPaginatedBundlesAction({
                sessionToken: token,
                startDate,
                endDate,
                sortBy,
                sortOrder,
                page,
                perPage,
                search,
            });

            if (result.status === "error") {
                throw new Error(result.message || "Failed to fetch bundles");
            }

            return result.data as PaginatedAllBundlesData;
        },
        enabled: !!startDate && !!endDate,
        staleTime: 5 * 60 * 1000,
        gcTime: 10 * 60 * 1000,
        refetchOnWindowFocus: false,
        placeholderData: (previousData: PaginatedAllBundlesData | undefined) =>
            previousData,
    }),

    /**
     * ShopifyQL: Sales metrics (revenue, orders, AOV)
     */
    salesMetrics: (dateRange: DateRange) => {
        const startDate = dateRange.from.toISOString();
        const endDate = dateRange.to.toISOString();

        return {
            queryKey: analyticsQueryKeys.shopifyql.salesMetrics(
                startDate,
                endDate,
            ),
            queryFn: async () => {
                const token = await app.idToken();
                const { getSalesMetricsAction } =
                    await import("@/features/analytics/actions/shopifyql-metrics.action");
                return getSalesMetricsAction(token, dateRange);
            },
            staleTime: 5 * 60 * 1000,
            gcTime: 10 * 60 * 1000,
            enabled: !!app,
        };
    },

    /**
     * ShopifyQL: Product performance for pairing analysis
     */
    productPerformance: (dateRange: DateRange, limit: number = 50) => {
        const startDate = dateRange.from.toISOString();
        const endDate = dateRange.to.toISOString();

        return {
            queryKey: analyticsQueryKeys.shopifyql.productPerformance(
                startDate,
                endDate,
                limit,
            ),
            queryFn: async () => {
                const token = await app.idToken();
                const { getProductPerformanceAction } =
                    await import("@/features/analytics/actions/shopifyql-metrics.action");
                return getProductPerformanceAction(token, dateRange, limit);
            },
            staleTime: 10 * 60 * 1000,
            gcTime: 30 * 60 * 1000,
            enabled: !!app,
        };
    },

    /**
     * ShopifyQL: Customer acquisition metrics
     */
    customerMetrics: (dateRange: DateRange) => {
        const startDate = dateRange.from.toISOString();
        const endDate = dateRange.to.toISOString();

        return {
            queryKey: analyticsQueryKeys.shopifyql.customerMetrics(
                startDate,
                endDate,
            ),
            queryFn: async () => {
                const token = await app.idToken();
                const { getCustomerMetricsAction } =
                    await import("@/features/analytics/actions/shopifyql-metrics.action");
                return getCustomerMetricsAction(token, dateRange);
            },
            staleTime: 5 * 60 * 1000,
            gcTime: 10 * 60 * 1000,
            enabled: !!app,
        };
    },

    /**
     * ShopifyQL: Session/visitor metrics
     */
    sessionMetrics: (dateRange: DateRange) => {
        const startDate = dateRange.from.toISOString();
        const endDate = dateRange.to.toISOString();

        return {
            queryKey: analyticsQueryKeys.shopifyql.sessionMetrics(
                startDate,
                endDate,
            ),
            queryFn: async () => {
                const token = await app.idToken();
                const { getSessionMetricsAction } =
                    await import("@/features/analytics/actions/shopifyql-metrics.action");
                return getSessionMetricsAction(token, dateRange);
            },
            staleTime: 5 * 60 * 1000,
            gcTime: 10 * 60 * 1000,
            enabled: !!app,
        };
    },

    /**
     * ShopifyQL: Sales broken down by day for charts
     */
    salesByDay: (dateRange: DateRange) => {
        const startDate = dateRange.from.toISOString();
        const endDate = dateRange.to.toISOString();

        return {
            queryKey: analyticsQueryKeys.shopifyql.salesByDay(
                startDate,
                endDate,
            ),
            queryFn: async () => {
                const token = await app.idToken();
                const { getSalesByDayAction } =
                    await import("@/features/analytics/actions/shopifyql-metrics.action");
                return getSalesByDayAction(token, dateRange);
            },
            staleTime: 5 * 60 * 1000,
            gcTime: 10 * 60 * 1000,
            enabled: !!app,
        };
    },
});

/**
 * ShopifyQL React Query hooks
 */
export function shopifyQLQueries(app: ReturnType<typeof useAppBridge>) {
    return {
        salesMetrics: (dateRange: DateRange) =>
            useQuery(analyticsQueries(app).salesMetrics(dateRange)),

        productPerformance: (dateRange: DateRange, limit?: number) =>
            useQuery(
                analyticsQueries(app).productPerformance(dateRange, limit),
            ),

        customerMetrics: (dateRange: DateRange) =>
            useQuery(analyticsQueries(app).customerMetrics(dateRange)),

        sessionMetrics: (dateRange: DateRange) =>
            useQuery(analyticsQueries(app).sessionMetrics(dateRange)),

        salesByDay: (dateRange: DateRange) =>
            useQuery(analyticsQueries(app).salesByDay(dateRange)),
    };
}
