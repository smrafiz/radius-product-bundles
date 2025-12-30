/**
 * Bundle cache invalidation utilities
 */

import { broadcastInvalidation } from "@/shared";
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

    // Broadcast to other tabs
    broadcastInvalidation("INVALIDATE_BUNDLES");
    broadcastInvalidation("INVALIDATE_ANALYTICS");

    console.log("[BundleCache] Invalidated and broadcasted");
};
