"use client";

import { useCallback } from "react";
import { settingsQueries } from "@/features/settings";
import { useQueryClient } from "@tanstack/react-query";
import { settingsQueryKeys } from "@/features/settings";
import { useAppBridge } from "@shopify/app-bridge-react";

export function useRefetchSettings() {
    const app = useAppBridge();
    const queryClient = useQueryClient();
    const queries = settingsQueries(app);

    const refetch = useCallback(() => {
        queryClient.invalidateQueries({
            queryKey: settingsQueryKeys.detail(),
        });
    }, [queryClient]);

    const reset = useCallback(async () => {
        await queryClient.resetQueries({
            queryKey: settingsQueryKeys.detail(),
        });
    }, [queryClient]);

    return { refetch, reset, queries };
}
