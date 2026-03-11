import { broadcastInvalidation } from "@/shared";
import { QueryClient } from "@tanstack/react-query";
import { bundlesQueryKeys } from "@/features/bundles";
import { analyticsQueryKeys } from "@/features/analytics";

export const invalidateBundleCache = async (queryClient: QueryClient) => {
    queryClient.removeQueries({
        queryKey: bundlesQueryKeys.all,
        type: "inactive",
    });

    await queryClient.invalidateQueries({
        queryKey: bundlesQueryKeys.all,
        refetchType: "active",
    });

    queryClient.removeQueries({
        queryKey: analyticsQueryKeys.all,
        type: "inactive",
    });

    await queryClient.invalidateQueries({
        queryKey: analyticsQueryKeys.all,
        refetchType: "active",
    });

    broadcastInvalidation("INVALIDATE_BUNDLES");
    broadcastInvalidation("INVALIDATE_ANALYTICS");
};
