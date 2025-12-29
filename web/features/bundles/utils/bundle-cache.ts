/*
 * Bundle cache invalidation utilities
 */

import { QueryClient } from "@tanstack/react-query";
import { bundlesQueryKeys } from "@/features/bundles";
import { analyticsQueryKeys } from "@/features/analytics";

/**
 * Invalidate bundle-related caches
 */
export const invalidateBundleCache = async (queryClient: QueryClient) => {
    // Invalidate bundle queries
    await queryClient.invalidateQueries({
        queryKey: bundlesQueryKeys.all,
        refetchType: "active",
    });

    // Invalidate analytics queries
    await queryClient.invalidateQueries({
        queryKey: analyticsQueryKeys.all,
        refetchType: "active",
    });
};
