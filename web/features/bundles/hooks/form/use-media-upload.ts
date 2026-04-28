"use client";

import {
    attachMediaToProductAction,
    createStagedUploadsAction,
    ingestStagedUploadsAction,
} from "@/features/bundles/actions";
import { uploadFilesToShopify } from "@/shared";
import { useAppBridge } from "@shopify/app-bridge-react";

/**
 * Hook for uploading media files to Shopify products
 */
export function useMediaUpload() {
    const app = useAppBridge();

    /**
     * Upload files to Shopify staged uploads (returns resource URLs, does NOT attach)
     */
    const uploadFilesOnly = async (
        files: File[],
    ): Promise<{
        success: boolean;
        resourceUrls: string[];
        error?: string;
    }> => {
        if (files.length === 0) {
            return { success: true, resourceUrls: [] };
        }

        try {
            const sessionToken = await app.idToken();

            // Get staged upload URLs
            const fileMetadata = files.map((file) => ({
                filename: file.name,
                mimeType: file.type,
                fileSize: file.size,
            }));

            const stagedResult = await createStagedUploadsAction(
                sessionToken,
                fileMetadata,
            );

            if (!stagedResult.success || !stagedResult.stagedTargets) {
                console.error("Failed to get staged URLs:", stagedResult.error);
                return {
                    success: false,
                    resourceUrls: [],
                    error: stagedResult.error || "Failed to stage uploads",
                };
            }

            const stagedResourceUrls = await uploadFilesToShopify(
                files,
                stagedResult.stagedTargets.map((target) => ({
                    url: target.url,
                    resourceUrl: target.resourceUrl,
                    parameters: target.parameters.map((param) => ({
                        name: param.name,
                        value: param.value,
                    })),
                })),
                sessionToken,
            );

            if (stagedResourceUrls.length === 0) {
                return {
                    success: false,
                    resourceUrls: [],
                    error: "No files were uploaded successfully",
                };
            }

            // Ingest staged uploads → permanent CDN URLs
            const ingestResult = await ingestStagedUploadsAction(
                sessionToken,
                stagedResourceUrls,
            );

            if (!ingestResult.success || ingestResult.urls.length === 0) {
                return {
                    success: false,
                    resourceUrls: [],
                    error: ingestResult.error || "Failed to ingest uploads",
                };
            }

            return { success: true, resourceUrls: ingestResult.urls };
        } catch (error) {
            console.error("File upload error:", error);
            return {
                success: false,
                resourceUrls: [],
                error: error instanceof Error ? error.message : "Upload failed",
            };
        }
    };

    /**
     * Upload files to Shopify and attach to the product
     */
    const uploadAndAttachMedia = async (
        productId: string,
        files: File[],
        altText?: string,
    ): Promise<{ success: boolean; error?: string }> => {
        if (files.length === 0) {
            return { success: true };
        }

        try {
            const sessionToken = await app.idToken();

            // Upload files
            const uploadResult = await uploadFilesOnly(files);

            if (!uploadResult.success) {
                return { success: false, error: uploadResult.error };
            }

            // Attach to product
            const attachResult = await attachMediaToProductAction(
                sessionToken,
                productId,
                uploadResult.resourceUrls,
                altText,
            );

            if (attachResult.status === "error") {
                return { success: false, error: attachResult.message };
            }

            return { success: true };
        } catch (error) {
            console.error("Media upload error:", error);
            return {
                success: false,
                error: error instanceof Error ? error.message : "Upload failed",
            };
        }
    };

    return { uploadFilesOnly, uploadAndAttachMedia };
}
