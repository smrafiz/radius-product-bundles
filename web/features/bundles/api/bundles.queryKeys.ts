/**
 * Centralized query keys for the bundle
 */
export const bundlesQueryKeys = {
    all: ["bundles"] as const,
    lists: () => [...bundlesQueryKeys.all, "list"] as const,
    list: (page?: number, itemsPerPage?: number, filters?: object) =>
        [...bundlesQueryKeys.all, "list", page ?? 1, itemsPerPage ?? 10, filters ?? {}] as const,
    metrics: () => [...bundlesQueryKeys.all, "metrics"] as const,
    detail: (bundleId: string) => [...bundlesQueryKeys.all, "detail", bundleId] as const,
};
