"use client";

import {
    BundleFormData,
    BundleStatus,
    calculateBundlePrice,
    calculateDiscountAmount,
    ExtendedBundleFormData,
    invalidateBundleCache,
    PendingMediaItem,
    useBundleStore,
    useCreateBundleProduct,
    useMediaUpload,
} from "@/features/bundles";
import { useShallow } from "zustand/react/shallow";
import { useState } from "react";
import {
    attachMediaToProductAction,
    createBundleAction,
    deleteBundleProductAction,
    updateBundleAction,
    updateBundleProductAction,
} from "@/features/bundles/actions";
import { useQueryClient } from "@tanstack/react-query";
import { useAppBridge } from "@shopify/app-bridge-react";
import {
    mediaMutations,
    useAppNavigation,
    useGlobalBanner,
    usePlan,
    withAsyncLoader,
} from "@/shared";
import { useTranslations } from "@/lib/i18n/provider";

/**
 * Hook for bundle form submission.
 *
 * Handles create/edit operations with media management, product creation,
 * and status/scheduling updates.
 */
export function useBundleSubmit(mode: "create" | "edit", bundleId?: string) {
    const app = useAppBridge();
    const queryClient = useQueryClient();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const {
        setSaving,
        resetDirty,
        setStep,
        setPendingProductDeletion,
        setBundleData,
    } = useBundleStore(
        useShallow((s) => ({
            setSaving: s.setSaving,
            resetDirty: s.resetDirty,
            setStep: s.setStep,
            setPendingProductDeletion: s.setPendingProductDeletion,
            setBundleData: s.setBundleData,
        })),
    );
    const v = useTranslations("Validation");
    const bs = useTranslations("Bundles.Submit");
    const { showSuccess, showError } = useGlobalBanner();
    const { bundleData } = useAppNavigation();
    const { refreshPlan } = usePlan();
    const { createProduct, isCreating: isCreatingProduct } =
        useCreateBundleProduct();
    const { uploadFilesOnly } = useMediaUpload();

    const deleteMedia = mediaMutations(app).smartDelete();

    /**
     * Calculate bundle pricing based on selected items and discount settings.
     */
    const calculateBundlePricing = (data: BundleFormData) => {
        const storeState = useBundleStore.getState();
        const currentItems = storeState.selectedItems;
        const originalPrice = calculateBundlePrice(currentItems);
        const round = (n: number) => Math.round(n * 100) / 100;

        const isBxgy = data.type === "BOGO" || data.type === "BUY_X_GET_Y";

        if (isBxgy) {
            const rewardItems = currentItems.filter((i) => i.role === "REWARD");
            const rewardPrice = calculateBundlePrice(rewardItems);
            const discountValue = data.discountValue ?? 0;

            let discountAmount = 0;
            if (discountValue > 0) {
                switch (data.discountType) {
                    case "PERCENTAGE":
                        discountAmount = round(
                            rewardPrice * (discountValue / 100),
                        );
                        break;
                    case "FIXED_AMOUNT":
                        discountAmount = round(
                            Math.min(discountValue, rewardPrice),
                        );
                        break;
                    case "CUSTOM_PRICE":
                        discountAmount = round(
                            Math.max(0, rewardPrice - discountValue),
                        );
                        break;
                }
            }

            return {
                bundlePrice: round(Math.max(0, originalPrice - discountAmount)),
                originalPrice: round(originalPrice),
            };
        }

        const { discountApplication, discountedProductIds } =
            storeState.bundleData;
        const applyToSpecific = discountApplication === "products";
        const discountedIds = new Set(discountedProductIds ?? []);

        const discountableItems = applyToSpecific
            ? currentItems.filter((item) => discountedIds.has(item.productId))
            : currentItems;
        const discountablePrice = calculateBundlePrice(discountableItems);

        if (data.discountType === "CUSTOM_PRICE" && data.discountValue) {
            const nonDiscountablePrice = originalPrice - discountablePrice;
            const finalPrice = nonDiscountablePrice + data.discountValue;
            return {
                bundlePrice: round(finalPrice),
                originalPrice: round(originalPrice),
            };
        }

        const discountAmount = calculateDiscountAmount(
            discountablePrice,
            data.discountType || "PERCENTAGE",
            data.discountValue || 0,
            data.maxDiscountAmount,
        );

        return {
            bundlePrice: round(originalPrice - discountAmount),
            originalPrice: round(originalPrice),
        };
    };

    /**
     * Process pending media in order - upload files first, then attach all in order.
     */
    const processMediaForProduct = async (
        token: string,
        productId: string,
        productTitle?: string,
    ): Promise<string[]> => {
        const currentPendingMedia = useBundleStore.getState().pendingMedia;

        if (currentPendingMedia.length === 0) {
            return [];
        }

        const filesToUpload = currentPendingMedia
            .filter(
                (item): item is PendingMediaItem & { type: "file" } =>
                    item.type === "file",
            )
            .map((item) => item.file);

        let uploadedFileUrls: string[] = [];

        if (filesToUpload.length > 0) {
            const uploadResult = await uploadFilesOnly(filesToUpload);

            if (!uploadResult.success) {
                console.error("File upload failed:", uploadResult.error);
            } else {
                uploadedFileUrls = uploadResult.resourceUrls;
            }
        }

        let fileIndex = 0;
        const orderedUrls: string[] = [];

        for (const item of currentPendingMedia) {
            if (item.type === "url") {
                orderedUrls.push(item.url);
            } else if (
                item.type === "file" &&
                fileIndex < uploadedFileUrls.length
            ) {
                orderedUrls.push(uploadedFileUrls[fileIndex]);
                fileIndex++;
            }
        }

        if (orderedUrls.length > 0) {
            const attachResult = await attachMediaToProductAction(
                token,
                productId,
                orderedUrls,
                productTitle,
            );

            if (attachResult.status === "error") {
                console.error("Failed to attach media:", attachResult.message);
            }
        }

        useBundleStore.getState().clearPendingMedia();

        return orderedUrls;
    };

    /**
     * Create a Shopify product and return product data.
     */
    const createShopifyProduct = async (
        token: string,
        data: ExtendedBundleFormData,
    ): Promise<{
        mainProductId: string;
        mainVariantId?: string;
        mediaUrls: string[];
    } | null> => {
        const { bundlePrice, originalPrice } = calculateBundlePricing(data);
        const productData = await createProduct(
            data.productTitle || data.name,
            data.productDescription,
            data.type,
            bundlePrice,
            originalPrice,
            data.status as BundleStatus,
        );

        if (!productData || !productData.mainProductId) {
            console.error("Failed to create Shopify product");
            return null;
        }

        const mediaUrls = await processMediaForProduct(
            token,
            productData.mainProductId,
            data.productTitle || data.name,
        );

        return {
            mainProductId: productData.mainProductId,
            mainVariantId: productData.mainVariantId,
            mediaUrls,
        };
    };

    /**
     * Merge bundle behavior fields from store into form data.
     */
    const mergeBundleBehavior = (data: ExtendedBundleFormData) => {
        const storeData = useBundleStore.getState().bundleData;
        data.discountApplication = storeData.discountApplication ?? "bundle";
        data.discountedProductIds = storeData.discountedProductIds ?? [];
        data.freeShipping = storeData.freeShipping ?? false;
        data.priority = storeData.priority ?? 0;
        if (storeData.volumeTiers) {
            data.volumeTiers = storeData.volumeTiers as typeof data.volumeTiers;
        }
        if (storeData.discountType) {
            data.discountType = storeData.discountType as typeof data.discountType;
        }
        if (storeData.discountValue !== undefined) {
            data.discountValue = storeData.discountValue as number;
        }
    };

    /**
     * Merge status and scheduling fields from store into form data.
     */
    const mergeStatusAndScheduling = (data: ExtendedBundleFormData) => {
        const storeData = useBundleStore.getState().bundleData;
        data.status = (storeData.status ?? "DRAFT") as BundleStatus;
        data.startDate = storeData.startDate;
        data.endDate = storeData.endDate;
    };

    /**
     * Submit bundle form data to database.
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
                    mergeStatusAndScheduling(data);

                    if (data.createProduct && data.productTitle) {
                        const productData = await createShopifyProduct(
                            token,
                            data,
                        );

                        if (!productData) {
                            showError(v("ERROR_CREATE_PRODUCT"), {
                                content: bs("createProductFailed"),
                            });
                            return;
                        }

                        data.mainProductId = productData.mainProductId;
                        data.mainVariantId = productData.mainVariantId;
                        data.images =
                            productData.mediaUrls.length > 0
                                ? [productData.mediaUrls[0]]
                                : [];
                    }

                    result = await createBundleAction(token, data);
                }
                // EDIT MODE
                else if (mode === "edit" && bundleId) {
                    const storeState = useBundleStore.getState();
                    const freshStoreData = storeState.bundleData;
                    data.settings = storeState.displaySettings;

                    mergeBundleBehavior(data);
                    mergeStatusAndScheduling(data);

                    let currentMainProductId = freshStoreData.mainProductId;
                    let currentMainVariantId = freshStoreData.mainVariantId;
                    let productWasDeleted = false;
                    let needsProductCreation: undefined | false | string =
                        false;

                    const {
                        pendingProductDeletion: isPendingDeletion,
                        removedMediaIds: currentRemovedMediaIds,
                    } = useBundleStore.getState();

                    // Delete product if switch was turned OFF
                    if (isPendingDeletion && currentMainProductId) {
                        const deleteResult = await deleteBundleProductAction(
                            token,
                            currentMainProductId,
                        );

                        if (deleteResult.status === "error") {
                            console.error(
                                "Failed to delete product:",
                                deleteResult.message,
                            );
                            showError(v("ERROR_DELETE_PRODUCT"), {
                                content:
                                    deleteResult.message ||
                                    bs("deleteProductFailed"),
                            });
                            return;
                        }

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
                            mainProductHandle: undefined,
                            mainVariantId: undefined,
                        });

                        setPendingProductDeletion(false);
                        useBundleStore.getState().clearPendingMedia();
                        useBundleStore.getState().clearRemovedMediaIds();
                    }

                    // Check if we need to CREATE a new product
                    // (switch ON but no product exists)
                    needsProductCreation =
                        data.createProduct &&
                        !currentMainProductId &&
                        (data.productTitle || data.name);

                    if (needsProductCreation) {
                        const titleToUse = data.productTitle || data.name;
                        const productData = await createShopifyProduct(token, {
                            ...data,
                            productTitle: titleToUse,
                        });

                        if (!productData) {
                            showError(v("ERROR_CREATE_PRODUCT"), {
                                content: bs("createProductFailed"),
                            });
                            return;
                        }

                        // Update IDs
                        currentMainProductId = productData.mainProductId;
                        currentMainVariantId = productData.mainVariantId;
                        data.mainProductId = productData.mainProductId;
                        data.mainVariantId = productData.mainVariantId;

                        // Update store
                        setBundleData({
                            mainProductId: productData.mainProductId,
                            mainVariantId: productData.mainVariantId,
                        });

                        if (currentMainProductId && currentMainVariantId) {
                            const { bundlePrice, originalPrice } =
                                calculateBundlePricing(data);

                            const priceResult = await updateBundleProductAction(
                                token,
                                {
                                    productId: currentMainProductId,
                                    variantId: currentMainVariantId,
                                    title: titleToUse,
                                    description: data.productDescription,
                                    bundlePrice,
                                    originalPrice,
                                },
                            );

                            if (priceResult.status === "error") {
                                console.error(
                                    "Failed to update price:",
                                    priceResult.message,
                                );
                            }
                        }
                    }

                    // ✅ Preserve mainProductId/mainVariantId if not deleted/created
                    if (!productWasDeleted && !needsProductCreation) {
                        data.mainProductId = currentMainProductId;
                        data.mainVariantId = currentMainVariantId;
                    }

                    // Process media BEFORE saving bundle so data.images is populated
                    let uploadedUrls: string[] = [];
                    if (
                        currentMainProductId &&
                        !needsProductCreation &&
                        !productWasDeleted
                    ) {
                        // Delete removed media from Shopify
                        if (currentRemovedMediaIds.length > 0) {
                            try {
                                const deleteResult =
                                    await deleteMedia.mutateAsync({
                                        productId: currentMainProductId,
                                        mediaIds: currentRemovedMediaIds,
                                    });
                                useBundleStore
                                    .getState()
                                    .clearRemovedMediaIds();
                            } catch (error) {
                                console.error("Media deletion failed:", error);
                            }
                        }

                        // Upload + attach pending media
                        uploadedUrls = await processMediaForProduct(
                            token,
                            currentMainProductId,
                            data.productTitle,
                        );

                        // Update existingMedia store so grid stays consistent
                        if (uploadedUrls.length > 0) {
                            const currentStore = useBundleStore.getState();
                            const newMediaItems = uploadedUrls.map(
                                (url, i) => ({
                                    id: `uploaded-${Date.now()}-${i}`,
                                    url,
                                }),
                            );
                            currentStore.setExistingMedia([
                                ...currentStore.existingMedia,
                                ...newMediaItems,
                            ]);
                        }
                    }

                    // Save only the featured image (first URL) to DB
                    const preStore = useBundleStore.getState();
                    const keptExistingUrls = preStore.existingMedia.map(
                        (m) => m.url,
                    );
                    const allUrls = [...keptExistingUrls, ...uploadedUrls];
                    data.images = allUrls.length > 0 ? [allUrls[0]] : [];

                    // For new product creation, images come from createShopifyProduct
                    if (needsProductCreation) {
                        data.images =
                            uploadedUrls.length > 0 ? [uploadedUrls[0]] : [];
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
                        result = await updateBundleAction(
                            token,
                            bundleId,
                            data,
                        );
                    }

                    // Update existing Shopify product title/price/status (skip if unchanged)
                    if (
                        result.status === "success" &&
                        currentMainProductId &&
                        currentMainVariantId &&
                        !needsProductCreation &&
                        !productWasDeleted
                    ) {
                        const { bundlePrice, originalPrice } =
                            calculateBundlePricing(data);

                        const snapshot =
                            useBundleStore.getState().savedProductSnapshot;
                        const currentProductIds = data.products
                            .map((p) => p.productId)
                            .sort();
                        // productTitle/productDescription live in React Hook Form (set via setValue in useBundleProduct)
                        const currentTitle =
                            data.productTitle ?? data.name ?? "";
                        const currentDescription =
                            data.productDescription ?? "";

                        const hasProductChanges =
                            !snapshot ||
                            snapshot.title !== currentTitle ||
                            snapshot.description !== currentDescription ||
                            snapshot.status !== (data.status || "DRAFT") ||
                            snapshot.discountType !==
                                (data.discountType || "PERCENTAGE") ||
                            snapshot.discountValue !==
                                (data.discountValue ?? 0) ||
                            (snapshot.maxDiscountAmount ?? null) !==
                                (data.maxDiscountAmount ?? null) ||
                            snapshot.productIds.join(",") !==
                                currentProductIds.join(",");

                        if (hasProductChanges) {
                            const productResult =
                                await updateBundleProductAction(token, {
                                    productId: currentMainProductId,
                                    variantId: currentMainVariantId,
                                    title: currentTitle,
                                    description: currentDescription,
                                    status: data.status as BundleStatus,
                                    bundlePrice,
                                    originalPrice,
                                });

                            if (productResult.status === "error") {
                                console.error(
                                    "Failed to update product:",
                                    productResult.message,
                                );
                            } else {
                                useBundleStore
                                    .getState()
                                    .setSavedProductSnapshot({
                                        title: currentTitle,
                                        description: currentDescription,
                                        status: data.status || "DRAFT",
                                        discountType:
                                            data.discountType || "PERCENTAGE",
                                        discountValue: data.discountValue ?? 0,
                                        maxDiscountAmount:
                                            data.maxDiscountAmount ?? null,
                                        productIds: currentProductIds,
                                    });
                            }
                        }
                    }
                } else {
                    showError(v("ERROR_UNEXPECTED"), {
                        content: bs("invalidMode"),
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
                    window.scrollTo({ top: 0, behavior: "smooth" });

                    if (mode === "create") {
                        void refreshPlan();
                        showSuccess(v("SUCCESS_BUNDLE_CREATED"), {
                            content: bs("bundleCreated"),
                            autoHide: true,
                        });
                        bundleData.edit(result.data.id);
                    } else {
                        showSuccess(v("SUCCESS_BUNDLE_UPDATED"), {
                            content: bs("bundleSaved"),
                            autoHide: true,
                        });
                    }
                } else {
                    showError(v("ERROR_SAVE_BUNDLE"), {
                        content: result.message || bs("checkInputs"),
                    });
                }
            } catch (error) {
                console.error(error);
                showError(v("ERROR_UNEXPECTED"), {
                    content: bs("tryAgainLater"),
                });
            } finally {
                setIsSubmitting(false);
                setSaving(false);

                if (mode === "create") {
                    setStep(1);
                }
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
