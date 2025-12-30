"use client";

import { useEffect } from "react";
import { listenForInvalidations } from "@/shared";
import { useQueryClient } from "@tanstack/react-query";
import { bundlesQueryKeys } from "@/features/bundles";
import { analyticsQueryKeys } from "@/features/analytics";

/**
 * Hook to sync cache invalidations across browser tabs
 *
 * Listens for invalidation messages from other tabs and updates cache.
 */
export function useCrossTabSync() {
    const queryClient = useQueryClient();

    useEffect(() => {
        return listenForInvalidations((message) => {
            switch (message.type) {
                case "INVALIDATE_BUNDLES":
                    void queryClient.invalidateQueries({
                        queryKey: bundlesQueryKeys.all,
                    });
                    console.log("[CrossTabSync] Invalidated bundles");
                    break;

                case "INVALIDATE_ANALYTICS":
                    void queryClient.invalidateQueries({
                        queryKey: analyticsQueryKeys.all,
                    });
                    console.log("[CrossTabSync] Invalidated analytics");
                    break;

                case "INVALIDATE_ALL":
                    void queryClient.invalidateQueries({
                        queryKey: bundlesQueryKeys.all,
                    });
                    void queryClient.invalidateQueries({
                        queryKey: analyticsQueryKeys.all,
                    });
                    console.log("[CrossTabSync] Invalidated all");
                    break;
            }
        });
    }, [queryClient]);
}
