import { getSessionToken } from "@/shared";
import { useAppBridge } from "@shopify/app-bridge-react";
import { getBundles, getBundleMetrics } from "@/actions";
import { dashboardQueryKeys } from "@/features/dashboard";

/**
 * Dashboard queries
 */
export const dashboardQueries = (app: ReturnType<typeof useAppBridge>) => ({
    bundles: {
        queryKey: dashboardQueryKeys.bundles(),
        queryFn: async () => {
            const token = await getSessionToken(app);
            const result = await getBundles(token);

            if (result.status === "error") {
                throw new Error(result.message);
            }

            return result.data ?? [];
        },
    },
    metrics: {
        queryKey: dashboardQueryKeys.metrics(),
        queryFn: async () => {
            const token = await getSessionToken(app);
            const result = await getBundleMetrics(token);

            if (result.status === "error") {
                throw new Error(result.message);
            }

            return result.data ?? {};
        },
    },
});
