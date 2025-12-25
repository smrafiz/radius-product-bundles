import { useAppBridge } from "@shopify/app-bridge-react";
import { dashboardQueryKeys } from "@/features/dashboard";
import { getBundlesAction, } from "@/features/bundles/actions";
import { getAnalyticsMetricsAction } from "@/features/analytics/actions";

/**
 * Dashboard queries
 */
export const dashboardQueries = (app: ReturnType<typeof useAppBridge>) => ({
    bundles: {
        queryKey: dashboardQueryKeys.bundles(),
        queryFn: async () => {
            const token = await app.idToken();
            const result = await getBundlesAction(token);

            if (result.status === "error") {
                throw new Error(result.message);
            }

            return result.data?.bundles ?? [];
        },
        staleTime: 5 * 60 * 1000,
        cacheTime: 10 * 60 * 1000,
        refetchOnWindowFocus: false,
    },
    metrics: {
        queryKey: dashboardQueryKeys.metrics(),
        queryFn: async () => {
            const token = await app.idToken();
            const result = await getAnalyticsMetricsAction(token);

            if (result.status === "error") {
                throw new Error(result.message);
            }

            return result.data ?? {};
        },
        staleTime: 10 * 60 * 1000,
        cacheTime: 15 * 60 * 1000,
        refetchOnWindowFocus: false,
    },
});
