/**
 * Centralized query keys for settings
 */
export const settingsQueryKeys = {
    all: ["settings"] as const,

    detail: () => [...settingsQueryKeys.all, "detail"] as const,

    locales: () => [...settingsQueryKeys.all, "locales"] as const,
};
