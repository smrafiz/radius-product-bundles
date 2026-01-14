/**
 * Top Bundles Query - React Query hooks
 */

import { useQuery } from "@tanstack/react-query";
import { useAppBridge } from "@shopify/app-bridge-react";
import { getTopBundlesAction } from "@/features/analytics/actions";
import { TopBundle, useAnalyticsStore } from "@/features/analytics";

/**
 * Hook to fetch top performing bundles
 *
 * @param limit - Maximum number of bundles to fetch
 * @returns Query result with top bundles data
 */
export function useTopBundles(limit: number = 10) {
    const app = useAppBridge();
    const { startDate, endDate } = useAnalyticsStore();

    return useQuery({
        queryKey: ["top-bundles", startDate, endDate, limit],
        queryFn: async () => {
            const token = await app.idToken();

            if (!token || !startDate || !endDate) {
                throw new Error("Missing required parameters");
            }

            const response = await getTopBundlesAction(
                token,
                startDate,
                endDate,
                limit,
            );

            console.log("getTopBundlesAction", response);

            if (response.status === "error") {
                throw new Error(
                    response.message || "Failed to fetch top bundles",
                );
            }

            return response.data as TopBundle[];
        },
        enabled: !!startDate && !!endDate,
        staleTime: 5 * 60 * 1000, // 5 minutes
    });
}
