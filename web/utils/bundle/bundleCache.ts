import { QueryClient } from "@tanstack/react-query";

export const invalidateBundleCache = async (queryClient: QueryClient) => {
    await queryClient.invalidateQueries({ queryKey: ["bundles"] });
    await queryClient.invalidateQueries({ queryKey: ["bundle-metrics"] });
};