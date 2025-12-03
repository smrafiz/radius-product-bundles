"use client";

import { useState } from "react";
import {
    attachMediaToProductAction,
    BundleFormData,
    calculateBundlePrice,
    calculateDiscountAmount,
    createBundleAction,
    deleteBundleProductAction,
    DisplaySettings,
    ExtendedBundleFormData, initialDisplaySettings,
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
        pendingProductDeletion,
        setPendingProductDeletion,
        setBundleData,
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

        clearPendingMedia();
    };

    /**
     * Create Shopify product and return product data
     */
    const createShopifyProduct = async (
        token: string,
        data: ExtendedBundleFormData,
    ): Promise<{ mainProductId: string; mainVariantId?: string } | null> => {
        console.log("Creating Shopify product...");

        const { bundlePrice, originalPrice } = calculateBundlePricing(data);
        const productData = await createProduct(
            data.productTitle || data.name,
            data.productDescription,
            data.type,
            bundlePrice,
            originalPrice,
        );

        if (!productData || !productData.mainProductId) {
            console.error("Failed to create Shopify product");
            return null;
        }

        console.log("✅ Product created:", productData);

        await processMediaForProduct(
            token,
            productData.mainProductId,
            data.productTitle || data.name,
        );

        return {
            mainProductId: productData.mainProductId,
            mainVariantId: productData.mainVariantId,
        };
    };

    /**
     * Merge bundle behavior fields from store into form data
     */
    const mergeBundleBehavior = (data: ExtendedBundleFormData) => {
        const storeData = useBundleStore.getState().bundleData;
        data.discountApplication = storeData.discountApplication ?? "bundle";
        data.discountedProductIds = storeData.discountedProductIds ?? [];
        data.freeShipping = storeData.freeShipping ?? false;
    };

    /*
     * Submit bundle form data to database
     */
    const handleSubmit = withAsyncLoader(
        async (data: ExtendedBundleFormData) => {
            try {
                setIsSubmitting(true);
                setSaving(true);
                let token = await app.idToken();
                let result;

                // CREATE MODE
                if (mode === "create") {
                    const freshStoreData = useBundleStore.getState();
                    data.settings = freshStoreData.displaySettings;

                    mergeBundleBehavior(data);

                    if (data.createProduct && data.productTitle) {
                        const productData = await createShopifyProduct(token, data);

                        if (!productData) {
                            showError("Failed to create product", {
                                content: "Could not create Shopify product. Please try again.",
                            });
                            return;
                        }

                        data.mainProductId = productData.mainProductId;
                        data.mainVariantId = productData.mainVariantId;
                    }

                    result = await createBundleAction(token, data);
                }
                // EDIT MODE
                else if (mode === "edit" && bundleId) {
                    const storeState = useBundleStore.getState();
                    const freshStoreData = storeState.bundleData;
                    data.settings = storeState.displaySettings;

                    mergeBundleBehavior(data);

                    let currentMainProductId = freshStoreData.mainProductId;
                    let currentMainVariantId = freshStoreData.mainVariantId;
                    let productWasDeleted = false;
                    let needsProductCreation: undefined | false | string = false;

                    // Delete product if switch was turned OFF
                    if (pendingProductDeletion && currentMainProductId) {
                        console.log("Deleting Shopify product...");

                        const deleteResult = await deleteBundleProductAction(token, currentMainProductId);

                        if (deleteResult.status === "error") {
                            console.error("Failed to delete product:", deleteResult.message);
                            showError("Failed to delete product", {
                                content: deleteResult.message || "Could not delete the Shopify product.",
                            });
                            return;
                        }

                        console.log("✅ Product deleted");

                        // Clear product IDs
                        productWasDeleted = true;
                        currentMainProductId = undefined;
                        currentMainVariantId = undefined;

                        // Update form data
                        data.mainProductId = undefined;
                        data.mainVariantId = undefined;

                        // Update store
                        setBundleData({
                            mainProductId: undefined,
                            mainVariantId: undefined,
                        });

                        setPendingProductDeletion(false);
                        clearPendingMedia();
                        clearRemovedMediaIds();
                    }

                    // Check if we need to CREATE a new product
                    // (switch ON but no product exists)
                    needsProductCreation =
                        data.createProduct &&
                        !currentMainProductId &&
                        (data.productTitle || data.name);

                    if (needsProductCreation) {
                        console.log("Creating product for existing bundle...");
                        const titleToUse = data.productTitle || data.name;
                        const productData = await createShopifyProduct(token, {
                            ...data,
                            productTitle: titleToUse,
                        });

                        if (!productData) {
                            showError("Failed to create product", {
                                content: "Could not create Shopify product. Please try again.",
                            });
                            return;
                        }

                        // Update IDs
                        currentMainProductId = productData.mainProductId;
                        currentMainVariantId = productData.mainVariantId;
                        data.mainProductId = productData.mainProductId;
                        data.mainVariantId = productData.mainVariantId;

                        console.log("🔍 Product created with:", {
                            mainProductId: productData.mainProductId,
                            mainVariantId: productData.mainVariantId,
                        });

                        // Update store
                        setBundleData({
                            mainProductId: productData.mainProductId,
                            mainVariantId: productData.mainVariantId,
                        });

                        if (currentMainProductId && currentMainVariantId) {
                            const { bundlePrice, originalPrice } = calculateBundlePricing(data);
                            console.log("🔍 Updating price after creation:", { bundlePrice, originalPrice });

                            const priceResult = await updateBundleProductAction(token, {
                                productId: currentMainProductId,
                                variantId: currentMainVariantId,
                                title: titleToUse,
                                description: data.productDescription,
                                bundlePrice,
                                originalPrice,
                            });

                            if (priceResult.status === "error") {
                                console.error("Failed to update price:", priceResult.message);
                            } else {
                                console.log("✅ Price updated after creation");
                            }
                        }
                    }

                    // ✅ Preserve mainProductId/mainVariantId if not deleted/created
                    if (!productWasDeleted && !needsProductCreation) {
                        data.mainProductId = currentMainProductId;
                        data.mainVariantId = currentMainVariantId;
                    }

                    // Update bundle in database
                    result = await updateBundleAction(token, bundleId, data);

                    // Token retry
                    if (
                        result.status === "error" &&
                        (result.message?.includes("token") ||
                            result.message?.includes("exp") ||
                            result.message?.includes("session"))
                    ) {
                        console.warn("[Submit] Token expired, retrying...");
                        token = await app.idToken();
                        result = await updateBundleAction(token, bundleId, data);
                    }

                    // Update existing Shopify product (if exists and wasn't just created/deleted)
                    if (
                        result.status === "success" &&
                        currentMainProductId &&
                        currentMainVariantId &&
                        !needsProductCreation &&
                        !productWasDeleted
                    ) {
                        const { bundlePrice, originalPrice } = calculateBundlePricing(data);

                        console.log("Updating Shopify product...");

                        const productResult = await updateBundleProductAction(
                            token,
                            {
                                productId: currentMainProductId,
                                variantId: currentMainVariantId,
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

                        // Delete removed media
                        if (removedMediaIds.length > 0) {
                            try {
                                const deleteResult = await deleteMedia.mutateAsync({
                                    productId: currentMainProductId,
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

                        // Process pending media
                        await processMediaForProduct(
                            token,
                            currentMainProductId,
                            data.productTitle,
                        );
                    }
                } else {
                    showError("Unexpected error", {
                        content: "Invalid mode or missing bundleId for edit.",
                    });
                    return;
                }

                // Token retry for create mode
                if (
                    mode === "create" &&
                    result.status === "error" &&
                    (result.message?.includes("token") ||
                        result.message?.includes("exp") ||
                        result.message?.includes("session"))
                ) {
                    console.warn("[Submit] Token expired, retrying...");
                    token = await app.idToken();
                    result = await createBundleAction(token, data);
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