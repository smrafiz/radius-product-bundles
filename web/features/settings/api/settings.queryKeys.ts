/**
 * Centralized query keys for settings
 */
export const settingsQueryKeys = {
    all: ["settings"] as const,

    detail: () => [...settingsQueryKeys.all, "detail"] as const,

    locales: () => [...settingsQueryKeys.all, "locales"] as const,

    /** Per-locale labels: ["settings", "labels", "fr"] */
    labels: (locale: string) =>
        [...settingsQueryKeys.all, "labels", locale] as const,

    /** All locale label entries (for bulk invalidation) */
    allLabels: () => [...settingsQueryKeys.all, "labels"] as const,
};
