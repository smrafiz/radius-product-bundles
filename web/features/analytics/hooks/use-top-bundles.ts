/**
 * Top Bundles Query - React Query hooks
 */

import { useQuery } from "@tanstack/react-query";
import { useAppBridge } from "@shopify/app-bridge-react";
import { analyticsQueries, useAnalyticsStore } from "@/features/analytics";

/**
 * Hook to fetch top performing bundles
 */
export function useTopBundles(limit = 10) {
    const app = useAppBridge();
    const { startDate, endDate } = useAnalyticsStore();
    const queries = analyticsQueries(app);

    return useQuery(queries.topBundles(startDate, endDate, limit));
}
