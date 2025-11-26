"use client";

import {
    BundleFormData,
    createBundleAction,
    invalidateBundleCache,
    updateBundleAction,
    updateBundleProductAction,
    useBundleStore,
    useCreateBundleProduct,
    useMediaUpload,
} from "@/features/bundles";
import { useQueryClient } from "@tanstack/react-query";
import { useAppBridge } from "@shopify/app-bridge-react";
import { mediaMutations, useAppNavigation, useGlobalBanner, withAsyncLoader, } from "@/shared";

/**
 * Hook for bundle form submission
 */
export function useBundleSubmit(mode: "create" | "edit", bundleId?: string) {
    const app = useAppBridge();
    const queryClient = useQueryClient();
    const {
        setSaving,
        resetDirty,
        setStep,
        mediaFiles,
        setMediaFiles,
        removedMediaIds,
        clearRemovedMediaIds,
    } = useBundleStore();
    const { showSuccess, showError } = useGlobalBanner();
    const { bundleData } = useAppNavigation();
    const { createProduct, isCreating: isCreatingProduct } =
        useCreateBundleProduct();
    const { uploadAndAttachMedia } = useMediaUpload();

    const deleteMedia = mediaMutations(app).smartDelete();

    const handleSubmit = withAsyncLoader(async (data: BundleFormData) => {
        try {
            setSaving(true);
            let token = await app.idToken();
            let result;

            if (mode === "create") {
                if (
                    mode === "create" &&
                    data.createProduct &&
                    data.productTitle
                ) {
                    console.log("Creating Shopify product...");

                    const productData = await createProduct(
                        data.productTitle,
                        data.productDescription,
                        data.type,
                    );

                    if (!productData || !productData.mainProductId) {
                        showError("Failed to create product", {
                            content:
                                "Could not create Shopify product. Please try again.",
                        });
                        return;
                    }

                    console.log("Product created:", productData);

                    // Add mainProductId to bundle data
                    data.mainProductId = productData.mainProductId;

                    const newFiles = (mediaFiles || []).filter(
                        (f): f is File => f instanceof File,
                    );

                    if (newFiles.length > 0) {
                        console.log(
                            `Uploading ${newFiles.length} media files...`,
                        );

                        const mediaResult = await uploadAndAttachMedia(
                            productData.mainProductId,
                            newFiles,
                            data.productTitle,
                        );

                        if (!mediaResult.success) {
                            console.error(
                                "Media upload failed:",
                                mediaResult.error,
                            );
                        } else {
                            console.log("✅ Media uploaded successfully");
                            setMediaFiles([]);
                        }
                    }
                }
            }

            if (mode === "create") {
                result = await createBundleAction(token, data);
            } else if (mode === "edit" && bundleId) {
                result = await updateBundleAction(token, bundleId, data);
            } else {
                showError("Unexpected error", {
                    content: "Invalid mode or missing bundleId for edit.",
                });

                return;
            }

            // Token retry
            if (
                result.status === "error" &&
                (result.message?.includes("token") ||
                    result.message?.includes("exp") ||
                    result.message?.includes("session"))
            ) {
                console.warn(
                    "[Submit] Token expired, retrying with fresh token...",
                );

                const freshToken = await app.idToken();

                // Retry the request
                result =
                    mode === "create"
                        ? await createBundleAction(freshToken, data)
                        : await updateBundleAction(freshToken, bundleId!, data);
            }

            // Update Shopify product (edit mode only)
            if (
                mode === "edit" &&
                result.status === "success" &&
                data.mainProductId &&
                (data.productTitle || data.productDescription)
            ) {
                if (data.productTitle || data.productDescription) {
                    console.log("Updating Shopify product...");

                    const productResult = await updateBundleProductAction(
                        token,
                        {
                            productId: data.mainProductId,
                            title: data.productTitle,
                            description: data.productDescription,
                        },
                    );

                    if (productResult.status === "error") {
                        console.error(
                            "Failed to update product:",
                            productResult.message,
                        );
                    } else {
                        console.log("✅ Product updated");
                    }
                }

                // Delete removed media using TanStack Query mutation
                if (removedMediaIds.length > 0) {
                    try {
                        const deleteResult = await deleteMedia.mutateAsync({
                            productId: data.mainProductId,
                            mediaIds: removedMediaIds,
                        });

                        console.log(
                            `✅ Media processed: ${deleteResult.deletedMediaIds.length} deleted`,
                        );

                        if (deleteResult.sharedCount > 0) {
                            console.log(
                                `   ↳ ${deleteResult.sharedCount} file(s) shared with other products`,
                            );
                        }

                        clearRemovedMediaIds();
                    } catch (error) {
                        console.error("Media deletion failed:", error);
                    }
                }

                // Upload media (only new files)
                if (mediaFiles && mediaFiles.length > 0 && data.mainProductId) {
                    const newFiles = mediaFiles.filter(
                        (f): f is File => f instanceof File,
                    );
                    if (newFiles.length > 0) {
                        console.log(
                            `Uploading ${newFiles.length} new media files...`,
                        );

                        const mediaResult = await uploadAndAttachMedia(
                            data.mainProductId,
                            newFiles,
                            data.productTitle,
                        );

                        if (!mediaResult.success) {
                            console.error(
                                "Media upload failed:",
                                mediaResult.error,
                            );
                        } else {
                            console.log("✅ Media uploaded");
                            setMediaFiles([]);
                        }
                    }
                }
            }

            // Handle success
            if (result.status === "success") {
                await invalidateBundleCache(queryClient);

                if (mode === "create") {
                    showSuccess("Bundle created successfully!", {
                        content: "Your bundle has been created.",
                        autoHide: true,
                    });
                    // Navigate to edit page
                    bundleData.edit(result.data.id);
                } else {
                    showSuccess("Bundle updated successfully!", {
                        content: "Your changes have been saved.",
                        autoHide: true,
                    });
                }
            } else {
                showError("Failed to save bundle", {
                    content:
                        result.message ||
                        "Please check your inputs and try again.",
                });
            }
        } catch (error) {
            console.error(error);
            showError("Unexpected error", {
                content: "Please try again later.",
            });
        } finally {
            setSaving(false);
            setStep(1);
        }
    });

    return {
        handleSubmit,
        resetDirty,
        isCreatingProduct,
        isDeletingMedia: deleteMedia.isPending,
    };
}
