/**
 * Centralized query keys for media operations
 */
export const mediaQueryKeys = {
    all: ["media"] as const,

    deletions: () => [...mediaQueryKeys.all, "deletion"] as const,

    deletion: (productId: string, mediaIds: string[]) =>
        [
            ...mediaQueryKeys.all,
            "deletion",
            productId,
            [...mediaIds].sort(),
        ] as const,
};