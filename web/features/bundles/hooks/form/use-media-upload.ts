"use client";

import {
    attachMediaToProductAction,
    createStagedUploadsAction,
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
            console.log("Getting staged upload URLs...");
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

            console.log(
                `✅ Got ${stagedResult.stagedTargets.length} staged URLs`,
            );

            // Upload files to staged URLs
            console.log("Uploading files to Shopify...");
            const resourceUrls = await uploadFilesToShopify(
                files,
                stagedResult.stagedTargets.map((target) => ({
                    url: target.url,
                    resourceUrl: target.resourceUrl,
                    parameters: target.parameters.map((param) => ({
                        name: param.name,
                        value: param.value,
                    })),
                })),
            );

            if (resourceUrls.length === 0) {
                return {
                    success: false,
                    resourceUrls: [],
                    error: "No files were uploaded successfully",
                };
            }

            console.log(`✅ Uploaded ${resourceUrls.length} files`);
            return { success: true, resourceUrls };
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
            console.log("Attaching media to product...");
            const attachResult = await attachMediaToProductAction(
                sessionToken,
                productId,
                uploadResult.resourceUrls,
                altText,
            );

            if (attachResult.status === "error") {
                return { success: false, error: attachResult.message };
            }

            console.log("✅ Media attached successfully");
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
