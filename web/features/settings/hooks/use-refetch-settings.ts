"use client";

import { useQueryClient } from "@tanstack/react-query";
import { settingsQueryKeys } from "@/features/settings";
import { useCallback } from "react";

/**
 * Hook to manually refetch settings
 */
export function useRefetchSettings() {
    const queryClient = useQueryClient();

    const refetch = useCallback(async () => {
        return await queryClient.invalidateQueries({
            queryKey: settingsQueryKeys.detail(),
        });
    }, [queryClient]);

    const isRefetching =
        queryClient.isFetching({
            queryKey: settingsQueryKeys.detail(),
        }) > 0;

    return { refetch, isRefetching };
}
