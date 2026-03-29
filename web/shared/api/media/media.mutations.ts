import { mediaQueryKeys } from "./media.queryKeys";
import { bundlesQueryKeys } from "@/features/bundles";
import { useAppBridge } from "@shopify/app-bridge-react";
import { smartDeleteProductMediaAction } from "@/shared/actions";
import { useMutation, useQueryClient } from "@tanstack/react-query";

/**
 * Media mutations factory
 */
export const mediaMutations = (app: ReturnType<typeof useAppBridge>) => ({
    /**
     * Smart delete product media mutation
     * Unlinks files, checks for orphans, and deletes unused files
     */
    smartDelete: () => {
        const queryClient = useQueryClient();

        return useMutation({
            mutationKey: mediaQueryKeys.deletions(),
            mutationFn: async ({
                productId,
                mediaIds,
            }: {
                productId: string;
                mediaIds: string[];
            }) => {
                const token = await app.idToken();
                const result = await smartDeleteProductMediaAction(
                    token,
                    productId,
                    mediaIds,
                );

                if (result.status === "error") {
                    throw new Error(result.message);
                }

                return result.data!;
            },
            onSuccess: (data, variables) => {
                // Invalidate bundle queries since media changed
                void queryClient.invalidateQueries({
                    queryKey: bundlesQueryKeys.all,
                });
            },
            onError: (error) => {
                console.error("❌ Media deletion failed:", error);
            },
        });
    },
});
