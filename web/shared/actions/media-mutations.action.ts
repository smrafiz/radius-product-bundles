"use server";

/**
 * Media Mutation Actions
 * Handles Shopify product media operations via GraphQL
 */

import { ApiResponse } from "@/shared";
import {
    FileDeleteDocument,
    FileDeleteMutation,
    FilesCheckOrphanedDocument,
    FilesCheckOrphanedQuery,
    FileUpdateRemoveRefsDocument,
    FileUpdateRemoveRefsMutation,
} from "@/lib/graphql/generated/graphql";
import { executeGraphQLMutation } from "@/lib";
import { handleSessionToken } from "@/lib/shopify";

/**
 * Delete files completely from Shopify
 */
export async function deleteFilesAction(
    sessionToken: string,
    fileIds: string[],
): Promise<ApiResponse<{ deletedFileIds: string[]; failedFileIds: string[] }>> {
    try {
        if (!fileIds || fileIds.length === 0) {
            return {
                status: "success",
                message: "No files to delete",
                data: { deletedFileIds: [], failedFileIds: [] },
            };
        }

        await handleSessionToken(sessionToken);

        const result = await executeGraphQLMutation<FileDeleteMutation>({
            query: FileDeleteDocument,
            variables: { fileIds },
            sessionToken,
        });

        if (result.errors && result.errors.length > 0) {
            return {
                status: "error",
                message: result.errors.map((e) => e.message).join(", "),
            };
        }

        const deletedIds = result.data?.fileDelete?.deletedFileIds || [];
        const failedIds = fileIds.filter((id) => !deletedIds.includes(id));

        return {
            status: "success",
            message: `Deleted ${deletedIds.length} file(s)`,
            data: { deletedFileIds: deletedIds, failedFileIds: failedIds },
        };
    } catch (error) {
        console.error("[deleteFiles] Error:", error);
        return {
            status: "error",
            message:
                error instanceof Error
                    ? error.message
                    : "Failed to delete files",
        };
    }
}

/**
 * Remove files from a product's media gallery without deleting them
 */
export async function removeFilesFromProductAction(
    sessionToken: string,
    productId: string,
    fileIds: string[],
): Promise<ApiResponse<{ updatedFileIds: string[] }>> {
    try {
        if (!fileIds || fileIds.length === 0) {
            return {
                status: "success",
                message: "No files to remove",
                data: { updatedFileIds: [] },
            };
        }

        if (!productId) {
            return {
                status: "error",
                message: "Product ID is required",
            };
        }

        await handleSessionToken(sessionToken);

        const files = fileIds.map((fileId) => ({
            id: fileId,
            referencesToRemove: [productId],
        }));

        const result =
            await executeGraphQLMutation<FileUpdateRemoveRefsMutation>({
                query: FileUpdateRemoveRefsDocument,
                variables: { files },
                sessionToken,
            });

        if (result.errors && result.errors.length > 0) {
            console.error(
                "[removeFilesFromProduct] GraphQL errors:",
                result.errors,
            );
            return {
                status: "error",
                message: result.errors.map((e) => e.message).join(", "),
            };
        }

        const userErrors = result.data?.fileUpdate?.userErrors;
        if (userErrors && userErrors.length > 0) {
            return {
                status: "error",
                message: userErrors.map((e) => e.message).join(", "),
            };
        }

        const updatedFiles = result.data?.fileUpdate?.files || [];
        const updatedIds = updatedFiles.map((f) => f.id);

        return {
            status: "success",
            message: `Removed ${updatedIds.length} file(s) from product`,
            data: { updatedFileIds: updatedIds },
        };
    } catch (error) {
        console.error("[removeFilesFromProduct] Error:", error);
        return {
            status: "error",
            message:
                error instanceof Error
                    ? error.message
                    : "Failed to remove files",
        };
    }
}

/**
 * Smart-delete - UNLINK FIRST, then check and cleanup
 */
export async function smartDeleteProductMediaAction(
    sessionToken: string,
    productId: string,
    mediaIds: string[],
): Promise<
    ApiResponse<{
        deletedMediaIds: string[];
        removedMediaIds: string[];
        sharedCount: number;
    }>
> {
    try {
        if (!mediaIds || mediaIds.length === 0) {
            return {
                status: "success",
                message: "No media to process",
                data: {
                    deletedMediaIds: [],
                    removedMediaIds: [],
                    sharedCount: 0,
                },
            };
        }

        await handleSessionToken(sessionToken);

        // Unlink ALL files from this product
        const unlinkResult = await removeFilesFromProductAction(
            sessionToken,
            productId,
            mediaIds,
        );

        if (unlinkResult.status === "error" || !unlinkResult.data) {
            return {
                status: "error",
                message: unlinkResult.message,
            };
        }

        const removedMediaIds = unlinkResult.data.updatedFileIds;

        // Smart polling for each file
        const deletedMediaIds: string[] = [];
        const stillUsedFiles: string[] = [];

        // Check all files in PARALLEL
        const results = await Promise.all(
            mediaIds.map(async (mediaId) => {
                const result = await checkFileOrphanedWithRetry(
                    mediaId,
                    sessionToken,
                    {
                        maxAttempts: 5,
                        initialDelay: 500,
                        maxDelay: 1200,
                        backoffMultiplier: 1,
                    },
                );

                return { mediaId, ...result };
            }),
        );

        // Separate orphaned files from used files
        const orphanedFiles = results
            .filter((r) => r.orphaned)
            .map((r) => r.mediaId);
        const usedFiles = results
            .filter((r) => !r.orphaned)
            .map((r) => r.mediaId);

        // Delete all orphaned files in PARALLEL
        if (orphanedFiles.length > 0) {
            const deleteResults = await Promise.all(
                orphanedFiles.map(async (mediaId) => {
                    const deleteResult = await deleteFilesAction(sessionToken, [
                        mediaId,
                    ]);

                    if (
                        deleteResult.status === "success" &&
                        deleteResult.data?.deletedFileIds.includes(mediaId)
                    ) {
                        return mediaId;
                    }
                    return null;
                }),
            );

            // Add successfully deleted IDs
            deletedMediaIds.push(
                ...deleteResults.filter((id): id is string => id !== null),
            );
        }

        // Files that are still used
        stillUsedFiles.push(...usedFiles);
        if (usedFiles.length > 0) {
            console.log(
                `  [smartDelete] Keeping ${usedFiles.length} file(s) (still used)`,
            );
        }

        const sharedCount = stillUsedFiles.length;

        const message =
            sharedCount > 0
                ? `✅ Removed ${removedMediaIds.length} file(s): ${deletedMediaIds.length} deleted, ${sharedCount} kept (used elsewhere)`
                : `✅ Removed ${removedMediaIds.length} file(s): ${deletedMediaIds.length} deleted`;

        return {
            status: "success",
            message,
            data: {
                deletedMediaIds,
                removedMediaIds,
                sharedCount,
            },
        };
    } catch (error) {
        console.error("[smartDelete] Error:", error);
        return {
            status: "error",
            message:
                error instanceof Error
                    ? error.message
                    : "Failed to process media",
        };
    }
}

/**
 * Check if a file is orphaned with smart polling
 */
async function checkFileOrphanedWithRetry(
    mediaId: string,
    sessionToken: string,
    options: {
        maxAttempts?: number;
        initialDelay?: number;
        maxDelay?: number;
        backoffMultiplier?: number;
    } = {},
): Promise<{ orphaned: boolean; attempts: number; totalTime: number }> {
    const {
        maxAttempts = 10,
        initialDelay = 500,
        maxDelay = 2000,
        backoffMultiplier = 1.3,
    } = options;

    const startTime = Date.now();
    let currentDelay = initialDelay;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        if (attempt > 1) {
            console.log(
                `  [retry] Attempt ${attempt}/${maxAttempts} after ${currentDelay}ms...`,
            );
            await new Promise((resolve) => setTimeout(resolve, currentDelay));

            currentDelay = Math.min(currentDelay * backoffMultiplier, maxDelay);
        } else {
            console.log(
                `  [retry] Attempt ${attempt}/${maxAttempts} (immediate)...`,
            );
        }

        try {
            const numericId = mediaId.split("/").pop();

            const checkResult =
                await executeGraphQLMutation<FilesCheckOrphanedQuery>({
                    query: FilesCheckOrphanedDocument,
                    variables: {
                        fileQuery: `id:${numericId} AND used_in:none`,
                    },
                    sessionToken,
                });

            const edges = checkResult.data?.files?.edges || [];

            if (edges.length > 0) {
                const totalTime = Date.now() - startTime;
                console.log(
                    `  [retry] ✅ Found orphaned after ${attempt} attempt(s) in ${totalTime}ms`,
                );
                return { orphaned: true, attempts: attempt, totalTime };
            }

            console.log(`  [retry] Not orphaned yet, will retry...`);
        } catch (error) {
            console.error(`  [retry] Error on attempt ${attempt}:`, error);
        }
    }

    const totalTime = Date.now() - startTime;
    console.log(
        `  [retry] ⚠️  Max attempts reached in ${totalTime}ms, assuming still used`,
    );
    return { orphaned: false, attempts: maxAttempts, totalTime };
}
