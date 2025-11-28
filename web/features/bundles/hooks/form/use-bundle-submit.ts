"use client";

import { useState } from "react";
import {
    attachMediaToProductAction,
    BundleFormData,
    calculateBundlePrice,
    calculateDiscountAmount,
    createBundleAction,
    ExtendedBundleFormData,
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
 * Handles create/edit operations with media management
 */
export function useBundleSubmit(mode: "create" | "edit", bundleId?: string) {
    const app = useAppBridge();
    const queryClient = useQueryClient();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const {
        setSaving,
        resetDirty,
        setStep,
        mediaFiles,
        setMediaFiles,
        removedMediaIds,
        clearRemovedMediaIds,
        selectedItems,
        selectedProductMediaUrls,
        clearSelectedProductMediaUrls,
        bundleData: storeBundleData,
    } = useBundleStore();
    const { showSuccess, showError } = useGlobalBanner();
    const { bundleData } = useAppNavigation();
    const { createProduct, isCreating: isCreatingProduct } =
        useCreateBundleProduct();
    const { uploadAndAttachMedia } = useMediaUpload();

    const deleteMedia = mediaMutations(app).smartDelete();

    /**
     * Calculate bundle pricing based on selected items and discount settings
     */
    const calculateBundlePricing = (data: BundleFormData) => {
        const originalPrice = calculateBundlePrice(selectedItems);

        // Handle CUSTOM_PRICE - use discountValue directly as the final price
        if (data.discountType === "CUSTOM_PRICE" && data.discountValue) {
            return {
                bundlePrice: data.discountValue,
                originalPrice,
            };
        }

        // Calculate discount for other types
        const discountAmount = calculateDiscountAmount(
            originalPrice,
            data.discountType || "PERCENTAGE",
            data.discountValue || 0,
            data.maxDiscountAmount,
        );

        return {
            bundlePrice: originalPrice - discountAmount,
            originalPrice,
        };
    };

    const handleSubmit = withAsyncLoader(
        async (data: ExtendedBundleFormData) => {
            try {
                setIsSubmitting(true);
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

                        const { bundlePrice, originalPrice } =
                            calculateBundlePricing(data);
                        const productData = await createProduct(
                            data.productTitle,
                            data.productDescription,
                            data.type,
                            bundlePrice,
                            originalPrice,
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
                        data.mainVariantId = productData.mainVariantId;

                        if (selectedProductMediaUrls && selectedProductMediaUrls.length > 0) {
                            // Get existing image paths from the product
                            const existingPaths = new Set(
                                (useBundleStore.getState().existingMedia || []).map((m) => {
                                    try {
                                        return new URL(m.url).pathname;
                                    } catch {
                                        return m.url;
                                    }
                                })
                            );

                            // Filter out URLs that already exist
                            const urlsToAttach = selectedProductMediaUrls.filter((url) => {
                                try {
                                    return !existingPaths.has(new URL(url).pathname);
                                } catch {
                                    return !existingPaths.has(url);
                                }
                            });

                            if (urlsToAttach.length > 0) {
                                console.log(`Attaching ${urlsToAttach.length} new media URLs (skipped ${selectedProductMediaUrls.length - urlsToAttach.length} existing)...`);

                                const attachResult = await attachMediaToProductAction(
                                    token,
                                    productData.mainProductId,
                                    urlsToAttach,
                                    productData.productTitle,
                                );

                                if (attachResult.status === "error") {
                                    console.error("Failed to attach media:", attachResult.message);
                                } else {
                                    console.log("✅ Media attached");
                                }
                            } else {
                                console.log("All selected media already exists on product, skipping attach");
                            }

                            clearSelectedProductMediaUrls();
                        }

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
                            : await updateBundleAction(
                                  freshToken,
                                  bundleId!,
                                  data,
                              );
                }

                // Update Shopify product (edit mode only)
                if (
                    mode === "edit" &&
                    result.status === "success" &&
                    data.mainProductId &&
                    (data.productTitle || data.productDescription)
                ) {
                    const { bundlePrice, originalPrice } =
                        calculateBundlePricing(data);

                    if (data.productTitle || data.productDescription) {
                        console.log("Updating Shopify product...");

                        const variantId = storeBundleData.mainVariantId || data.mainVariantId;

                        const productResult = await updateBundleProductAction(
                            token,
                            {
                                productId: data.mainProductId,
                                variantId,
                                title: data.productTitle,
                                description: data.productDescription,
                                bundlePrice,
                                originalPrice,
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
                            // Continue with save - don't block on media deletion failure
                        }
                    }

                    if (selectedProductMediaUrls && selectedProductMediaUrls.length > 0) {
                        // Get existing image paths from the product
                        const existingPaths = new Set(
                            (useBundleStore.getState().existingMedia || []).map((m) => {
                                try {
                                    return new URL(m.url).pathname;
                                } catch {
                                    return m.url;
                                }
                            })
                        );

                        // Filter out URLs that already exist
                        const urlsToAttach = selectedProductMediaUrls.filter((url) => {
                            try {
                                return !existingPaths.has(new URL(url).pathname);
                            } catch {
                                return !existingPaths.has(url);
                            }
                        });

                        if (urlsToAttach.length > 0) {
                            console.log(`Attaching ${urlsToAttach.length} new media URLs (skipped ${selectedProductMediaUrls.length - urlsToAttach.length} existing)...`);

                            const attachResult = await attachMediaToProductAction(
                                token,
                                data.mainProductId,
                                urlsToAttach,
                                data.productTitle,
                            );

                            if (attachResult.status === "error") {
                                console.error("Failed to attach media:", attachResult.message);
                            } else {
                                console.log("✅ Media attached");
                            }
                        } else {
                            console.log("All selected media already exists on product, skipping attach");
                        }

                        clearSelectedProductMediaUrls();
                    }

                    // Upload media (only new files)
                    if (
                        mediaFiles &&
                        mediaFiles.length > 0 &&
                        data.mainProductId
                    ) {
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
                setIsSubmitting(false);
                setSaving(false);
                setStep(1);
            }
        },
    );

    return {
        handleSubmit,
        resetDirty,
        isSubmitting,
        isCreatingProduct,
        isDeletingMedia: deleteMedia.isPending,
    };
}
