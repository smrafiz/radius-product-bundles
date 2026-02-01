"use client";

import { settingsQueries } from "@/features/settings";
import { useQueryClient } from "@tanstack/react-query";
import { useAppBridge } from "@shopify/app-bridge-react";

/**
 * Hook to refetch settings from API.
 *
 * Use this to refresh settings after external changes,
 * such as when the customizer modal is closed.
 */
export function useRefetchSettings() {
    const app = useAppBridge();
    const queryClient = useQueryClient();
    const queries = settingsQueries(app);

    /**
     * Invalidates and refetches settings query.
     */
    const refetch = () => {
        queryClient.invalidateQueries({
            queryKey: queries.detail().queryKey,
        });
    };

    /**
     * Resets settings query to loading state and refetches.
     */
    const reset = async () => {
        await queryClient.resetQueries({
            queryKey: queries.detail().queryKey,
        });
    };

    return { refetch, reset };
}
