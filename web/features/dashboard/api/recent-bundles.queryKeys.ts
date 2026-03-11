export const recentBundlesKeys = {
    all: ["recent-bundles"] as const,
    list: (limit: number) => [...recentBundlesKeys.all, "list", limit] as const,
};
