import { useAppBridge } from "@shopify/app-bridge-react";
import { recentBundlesKeys } from "./recent-bundles.queryKeys";
import { getRecentActiveBundlesAction } from "@/features/dashboard/actions/recent-bundles.action";
import type { TopBundle } from "@/features/analytics";

export const recentBundlesQueries = (app: ReturnType<typeof useAppBridge>) => ({
    list: (limit: number = 5) => ({
        queryKey: recentBundlesKeys.list(limit),
        queryFn: async (): Promise<TopBundle[]> => {
            const token = await app.idToken();
            const result = await getRecentActiveBundlesAction(token, limit);

            if (result.status === "error") {
                throw new Error(
                    result.message || "Failed to fetch recent bundles",
                );
            }

            return result.data ?? [];
        },
        staleTime: 60_000,
        gcTime: 5 * 60_000,
        refetchOnWindowFocus: false,
    }),
});
