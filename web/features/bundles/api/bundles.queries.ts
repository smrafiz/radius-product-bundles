import {
    BundleDetail,
    BundleFilters,
    BundleListItem,
    BundleMetricsData,
    bundlesQueryKeys,
    getBundleAction,
    getBundleMetricsAction,
    getBundlesAction,
} from "@/features/bundles";
import { useAppBridge } from "@shopify/app-bridge-react";

/**
 * Bundles queries
 */
export const bundlesQueries = (
    app: ReturnType<typeof useAppBridge>,
    page: number = 1,
    itemsPerPage: number = 10,
    filters?: BundleFilters,
) => ({
    list: {
        queryKey: bundlesQueryKeys.list(page, itemsPerPage, filters),
        queryFn: async () => {
            const token = await app.idToken();
            const result = await getBundlesAction(
                token,
                page,
                itemsPerPage,
                filters,
            );

            if (result.status === "error") {
                throw new Error(result.message);
            }

            return {
                bundles: result.data?.bundles as BundleListItem[],
                pagination: result.data?.pagination,
            };
        },
        staleTime: 5 * 60 * 1000,
        cacheTime: 10 * 60 * 1000,
        refetchOnWindowFocus: false,
    },

    detail: (bundleId: string) => ({
        queryKey: bundlesQueryKeys.detail(bundleId),
        queryFn: async () => {
            const token = await app.idToken();
            const result = await getBundleAction(token, bundleId);

            if (result.status === "error") {
                throw new Error(result.message);
            }

            return result.data as BundleDetail;
        },
        enabled: !!bundleId,
        staleTime: 5 * 60 * 1000,
        cacheTime: 10 * 60 * 1000,
        refetchOnWindowFocus: false,
    }),

    metrics: {
        queryKey: bundlesQueryKeys.metrics(),
        queryFn: async () => {
            const token = await app.idToken();
            const result = await getBundleMetricsAction(token);

            if (result.status === "error") {
                throw new Error(result.message);
            }

            return result.data as BundleMetricsData;
        },
        staleTime: 10 * 60 * 1000,
        cacheTime: 15 * 60 * 1000,
        refetchOnWindowFocus: false,
    },
});
