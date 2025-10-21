import { QueryClient } from "@tanstack/react-query";
import { bundlesQueryKeys } from "@/features/bundles";
import { dashboardQueryKeys } from "@/features/dashboard";

export const invalidateBundleCache = async (queryClient: QueryClient) => {
    await queryClient.invalidateQueries({
        queryKey: bundlesQueryKeys.all,
        refetchType: 'active'
    });

    await queryClient.invalidateQueries({
        queryKey: dashboardQueryKeys.metrics(),
        refetchType: 'active'
    });

    await queryClient.invalidateQueries({
        queryKey: dashboardQueryKeys.bundles(),
        refetchType: 'active'
    });
};
