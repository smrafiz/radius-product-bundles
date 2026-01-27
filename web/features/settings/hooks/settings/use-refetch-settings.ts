"use client";

import { useQueryClient } from "@tanstack/react-query";
import { settingsQueryKeys } from "@/features/settings";

/**
 * Hook to refetch settings from API.
 *
 * Use this to refresh settings after external changes,
 * such as when the customizer modal is closed.
 */
export function useRefetchSettings() {
    const queryClient = useQueryClient();

    /**
     * Invalidates and refetches settings query.
     */
    const refetch = () => {
        queryClient.invalidateQueries({
            queryKey: settingsQueryKeys.detail(),
        });
    };

    return { refetch };
}
