"use client";

import { smartDeleteProductMediaAction } from "@/shared/actions";
import { useMutation, useQueryClient } from "@tanstack/react-query";

/**
 * Hook for smart media deletion with loading states
 */
export function useSmartDeleteMedia() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({
            sessionToken,
            productId,
            mediaIds,
        }: {
            sessionToken: string;
            productId: string;
            mediaIds: string[];
        }) => {
            const result = await smartDeleteProductMediaAction(
                sessionToken,
                productId,
                mediaIds,
            );

            if (result.status === "error") {
                throw new Error(result.message);
            }

            return result.data!;
        },
        onSuccess: (data) => {
            // Invalidate queries to refetch bundles
            queryClient.invalidateQueries({ queryKey: ["bundles"] });
        },
        onError: (error) => {
            console.error("❌ Delete failed:", error);
        },
    });
}
