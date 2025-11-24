"use server";

/**
 * Media Mutation Actions
 * Handles Shopify product media operations via GraphQL
 *
 * Strategy: Try delete first, fallback to unlink if delete fails
 * This is safe because Shopify won't delete files that have references
 */

import { ApiResponse } from "@/shared";
import {
    FileDeleteDocument,
    FileDeleteMutation,
    FileUpdateRemoveRefsDocument,
    FileUpdateRemoveRefsMutation,
} from "@/lib/graphql/generated/graphql";
import { executeGraphQLMutation } from "@/lib";
import { handleSessionToken } from "@/lib/shopify";

/**
 * Delete files completely from Shopify
 *
 * @param sessionToken - Shopify session token
 * @param fileIds - Array of file GIDs to delete
 * @returns ApiResponse with deleted and failed file IDs
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

        console.log("[deleteFiles] File IDs:", fileIds);

        const result = await executeGraphQLMutation<FileDeleteMutation>({
            query: FileDeleteDocument,
            variables: { fileIds },
            sessionToken,
        });

        if (result.errors && result.errors.length > 0) {
            console.error("[deleteFiles] GraphQL errors:", result.errors);
            return {
                status: "error",
                message: result.errors.map((e) => e.message).join(", "),
            };
        }

        const userErrors = result.data?.fileDelete?.userErrors;
        if (userErrors && userErrors.length > 0) {
            console.warn("[deleteFiles] User errors:", userErrors);
        }

        const deletedIds = result.data?.fileDelete?.deletedFileIds || [];
        const failedIds = fileIds.filter((id) => !deletedIds.includes(id));

        console.log(
            "[deleteFiles] ✅ Deleted:",
            deletedIds.length,
            "Failed:",
            failedIds.length,
        );

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
 *
 * @param sessionToken - Shopify session token
 * @param productId - The product GID to remove files from
 * @param fileIds - Array of file GIDs to remove from the product
 * @returns ApiResponse with updated file IDs
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

        console.log("[removeFilesFromProduct] Product:", productId);
        console.log("[removeFilesFromProduct] File IDs:", fileIds);

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
            console.error("[removeFilesFromProduct] User errors:", userErrors);
            return {
                status: "error",
                message: userErrors.map((e) => e.message).join(", "),
            };
        }

        const updatedFiles = result.data?.fileUpdate?.files || [];
        const updatedIds = updatedFiles.map((f) => f.id);
        console.log(
            "[removeFilesFromProduct] ✅ Removed:",
            updatedIds.length,
            "files",
        );

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
 * Smart delete - tries to delete, falls back to unlink if delete fails
 *
 * Strategy:
 * 1. Try fileDelete for all files
 * 2. For files that failed (have other references), use fileUpdate to unlink
 *
 * @param sessionToken - Shopify session token
 * @param productId - The product GID we're removing media from
 * @param mediaIds - Array of media GIDs to remove
 * @returns ApiResponse with results
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

        if (!productId) {
            return {
                status: "error",
                message: "Product ID is required",
            };
        }

        console.log("[smartDelete] Processing:", mediaIds.length, "files");

        // Step 1: Try to delete all files
        const deleteResult = await deleteFilesAction(sessionToken, mediaIds);

        if (deleteResult.status === "error" || !deleteResult.data) {
            console.warn("[smartDelete] Delete failed, falling back to unlink");
            const unlinkResult = await removeFilesFromProductAction(
                sessionToken,
                productId,
                mediaIds,
            );

            return {
                status: unlinkResult.status,
                message: unlinkResult.message,
                data: unlinkResult.data
                    ? {
                          deletedMediaIds: [],
                          removedMediaIds: unlinkResult.data.updatedFileIds,
                          sharedCount: mediaIds.length,
                      }
                    : undefined,
            };
        }

        const { deletedFileIds, failedFileIds } = deleteResult.data;
        const removedMediaIds: string[] = [];

        // Step 2: Unlink files that failed to delete
        if (failedFileIds.length > 0) {
            console.log(
                `[smartDelete] ${failedFileIds.length} files have references, unlinking...`,
            );

            const unlinkResult = await removeFilesFromProductAction(
                sessionToken,
                productId,
                failedFileIds,
            );

            if (unlinkResult.status === "success" && unlinkResult.data) {
                removedMediaIds.push(...unlinkResult.data.updatedFileIds);
            }
        }

        console.log(
            `[smartDelete] ✅ Deleted: ${deletedFileIds.length}, Unlinked: ${removedMediaIds.length}`,
        );

        return {
            status: "success",
            message: `Processed: ${deletedFileIds.length} deleted, ${removedMediaIds.length} unlinked`,
            data: {
                deletedMediaIds: deletedFileIds,
                removedMediaIds,
                sharedCount: failedFileIds.length,
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
 * Delete product media - main function for bundle media removal
 *
 * @param sessionToken - Shopify session token
 * @param productId - The product GID
 * @param mediaIds - Array of media GIDs to delete
 * @returns ApiResponse with deleted media IDs
 */
export async function deleteProductMediaAction(
    sessionToken: string,
    productId: string,
    mediaIds: string[],
): Promise<ApiResponse<{ deletedMediaIds: string[] }>> {
    const result = await smartDeleteProductMediaAction(
        sessionToken,
        productId,
        mediaIds,
    );

    if (result.status === "success" && result.data) {
        return {
            status: "success",
            message: result.message,
            data: {
                deletedMediaIds: [
                    ...result.data.deletedMediaIds,
                    ...result.data.removedMediaIds,
                ],
            },
        };
    }

    return {
        status: result.status,
        message: result.message,
    };
}

/**
 * Batch delete product media for large batches
 *
 * @param sessionToken - Shopify session token
 * @param productId - The product GID
 * @param mediaIds - Array of media GIDs to delete
 * @param batchSize - Max items per request (default: 50)
 * @returns ApiResponse with all deleted media IDs
 */
export async function batchDeleteProductMediaAction(
    sessionToken: string,
    productId: string,
    mediaIds: string[],
    batchSize: number = 50,
): Promise<ApiResponse<{ deletedMediaIds: string[] }>> {
    if (!mediaIds || mediaIds.length === 0) {
        return {
            status: "success",
            message: "No media to delete",
            data: { deletedMediaIds: [] },
        };
    }

    if (mediaIds.length <= batchSize) {
        return deleteProductMediaAction(sessionToken, productId, mediaIds);
    }

    const allDeletedIds: string[] = [];
    const errors: string[] = [];

    for (let i = 0; i < mediaIds.length; i += batchSize) {
        const chunk = mediaIds.slice(i, i + batchSize);
        const result = await deleteProductMediaAction(
            sessionToken,
            productId,
            chunk,
        );

        if (result.status === "success" && result.data) {
            allDeletedIds.push(...result.data.deletedMediaIds);
        } else if (result.message) {
            errors.push(result.message);
        }
    }

    if (errors.length > 0 && allDeletedIds.length === 0) {
        return {
            status: "error",
            message: errors.join("; "),
        };
    }

    return {
        status: "success",
        message: `Deleted ${allDeletedIds.length} of ${mediaIds.length} media items`,
        data: { deletedMediaIds: allDeletedIds },
    };
}
