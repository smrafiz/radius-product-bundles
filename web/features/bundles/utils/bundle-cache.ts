import { QueryClient } from "@tanstack/react-query";
import { bundlesQueryKeys } from "@/features/bundles";

export const invalidateBundleCache = async (queryClient: QueryClient) => {
    await queryClient.invalidateQueries({ queryKey: bundlesQueryKeys.list() });
    await queryClient.invalidateQueries({ queryKey: bundlesQueryKeys.metrics() });
};
