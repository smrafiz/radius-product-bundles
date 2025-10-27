import {
    getSessionToken,
} from "@/shared";
import {
    BundleFilters,
    BundleListItem,
    BundleMetricsData,
    bundlesQueryKeys,
    getBundleMetrics,
    getBundles,
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
            const token = await getSessionToken(app);
            const result = await getBundles(token, page, itemsPerPage, filters);

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

    metrics: {
        queryKey: bundlesQueryKeys.metrics(),
        queryFn: async () => {
            const token = await getSessionToken(app);
            const result = await getBundleMetrics(token);

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
