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
import { useAppBridge } from "@shopify/app-bridge-react";

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
});
