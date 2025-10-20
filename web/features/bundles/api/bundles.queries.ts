import {
    getSessionToken,
} from "@/shared";
import {
    BundleListItem,
    BundleMetricsData,
    bundlesQueryKeys,
    getBundles,
} from "@/features/bundles";
import { useAppBridge } from "@shopify/app-bridge-react";
import { getBundleMetrics } from "@/actions";

/**
 * Dashboard queries
 */
export const bundlesQueries = (
    app: ReturnType<typeof useAppBridge>,
    page: number = 1,
    itemsPerPage: number = 10,
    filters?: {
        search?: string;
        status?: string[];
        type?: string[];
        sortBy?: string;
        sortDirection?: "asc" | "desc";
    },
) => ({
    list: {
        queryKey: [bundlesQueryKeys.list(), page, itemsPerPage, filters],
        queryFn: async () => {
            const token = await getSessionToken(app);
            const result = await getBundles(token, page, itemsPerPage, filters);

            if (result.status === "error") {
                throw new Error(result.message);
            }

            return {
                bundles: result.data as BundleListItem[],
                pagination: result.pagination,
            };
        },
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
    },
});
