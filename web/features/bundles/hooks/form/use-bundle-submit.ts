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
    PendingMediaItem,
    updateBundleAction,
    updateBundleProductAction,
    useBundleStore,
    useCreateBundleProduct,
    useMediaUpload,
} from "@/features/bundles";
import { useQueryClient } from "@tanstack/react-query";
import { useAppBridge } from "@shopify/app-bridge-react";
import { mediaMutations, useAppNavigation, useGlobalBanner, withAsyncLoader } from "@/shared";

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
        pendingMedia,
        clearPendingMedia,
        removedMediaIds,
        clearRemovedMediaIds,
        selectedItems,
        bundleData: storeBundleData,
    } = useBundleStore();
    const { showSuccess, showError } = useGlobalBanner();
    const { bundleData } = useAppNavigation();
    const { createProduct, isCreating: isCreatingProduct } =
        useCreateBundleProduct();
    const { uploadFilesOnly } = useMediaUpload();

    const deleteMedia = mediaMutations(app).smartDelete();

    /**
     * Calculate bundle pricing based on selected items and discount settings
     */
    const calculateBundlePricing = (data: BundleFormData) => {
        const originalPrice = calculateBundlePrice(selectedItems);

        if (data.discountType === "CUSTOM_PRICE" && data.discountValue) {
            return {
                bundlePrice: data.discountValue,
                originalPrice,
            };
        }

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

    /**
     * Process pending media in order - upload files first, then attach all in order
     */
    const processMediaForProduct = async (
        token: string,
        productId: string,
        productTitle?: string,
    ) => {
        if (pendingMedia.length === 0) {
            return;
        }

        console.log(`Processing ${pendingMedia.length} pending media items in order...`);

        // Step 1: Upload all files first to get their resource URLs
        const filesToUpload = pendingMedia
            .filter((item): item is PendingMediaItem & { type: 'file' } => item.type === 'file')
            .map((item) => item.file);

        let uploadedFileUrls: string[] = [];

        if (filesToUpload.length > 0) {
            console.log(`Uploading ${filesToUpload.length} files...`);
            const uploadResult = await uploadFilesOnly(filesToUpload);

            if (!uploadResult.success) {
                console.error("File upload failed:", uploadResult.error);
            } else {
                uploadedFileUrls = uploadResult.resourceUrls;
                console.log(`✅ Uploaded ${uploadedFileUrls.length} files`);
            }
        }

        // Step 2: Build ordered list of ALL URLs to attach
        let fileIndex = 0;
        const orderedUrls: string[] = [];

        for (const item of pendingMedia) {
            if (item.type === 'url') {
                orderedUrls.push(item.url);
            } else if (item.type === 'file' && fileIndex < uploadedFileUrls.length) {
                orderedUrls.push(uploadedFileUrls[fileIndex]);
                fileIndex++;
            }
        }

        // Step 3: Attach all media in order with single API call
        if (orderedUrls.length > 0) {
            console.log(`Attaching ${orderedUrls.length} media items in order...`);

            const attachResult = await attachMediaToProductAction(
                token,
                productId,
                orderedUrls,
                productTitle,
            );

            if (attachResult.status === "error") {
                console.error("Failed to attach media:", attachResult.message);
            } else {
                console.log("✅ All media attached in order");
            }
        }

        // Clear pending media
        clearPendingMedia();
    };

    const handleSubmit = withAsyncLoader(
        async (data: ExtendedBundleFormData) => {
            try {
                setIsSubmitting(true);
                setSaving(true);
                let token = await app.idToken();
                let result;

                // CREATE MODE: Create product first if enabled
                if (mode === "create" && data.createProduct && data.productTitle) {
                    console.log("Creating Shopify product...");

                    const { bundlePrice, originalPrice } = calculateBundlePricing(data);
                    const productData = await createProduct(
                        data.productTitle,
                        data.productDescription,
                        data.type,
                        bundlePrice,
                        originalPrice,
                    );

                    if (!productData || !productData.mainProductId) {
                        showError("Failed to create product", {
                            content: "Could not create Shopify product. Please try again.",
                        });
                        return;
                    }

                    console.log("Product created:", productData);

                    data.mainProductId = productData.mainProductId;
                    data.mainVariantId = productData.mainVariantId;

                    // Process pending media in order
                    await processMediaForProduct(
                        token,
                        productData.mainProductId,
                        data.productTitle,
                    );
                }

                // Create or update bundle
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
                    console.warn("[Submit] Token expired, retrying with fresh token...");
                    const freshToken = await app.idToken();
                    result =
                        mode === "create"
                            ? await createBundleAction(freshToken, data)
                            : await updateBundleAction(freshToken, bundleId!, data);
                }

                // EDIT MODE: Update Shopify product
                if (
                    mode === "edit" &&
                    result.status === "success" &&
                    data.mainProductId &&
                    (data.productTitle || data.productDescription)
                ) {
                    const { bundlePrice, originalPrice } = calculateBundlePricing(data);

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
                            console.error("Failed to update product:", productResult.message);
                        } else {
                            console.log("✅ Product updated");
                        }
                    }

                    // Delete removed media
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

                    // Process pending media in order
                    await processMediaForProduct(
                        token,
                        data.mainProductId,
                        data.productTitle,
                    );
                }

                // Handle success
                if (result.status === "success") {
                    await invalidateBundleCache(queryClient);

                    if (mode === "create") {
                        showSuccess("Bundle created successfully!", {
                            content: "Your bundle has been created.",
                            autoHide: true,
                        });
                        bundleData.edit(result.data.id);
                    } else {
                        showSuccess("Bundle updated successfully!", {
                            content: "Your changes have been saved.",
                            autoHide: true,
                        });
                    }
                } else {
                    showError("Failed to save bundle", {
                        content: result.message || "Please check your inputs and try again.",
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