"use client";

import { useFormContext, useWatch } from "react-hook-form";
import { triggerSaveBar, useModalStore } from "@/shared";
import { useAppBridge } from "@shopify/app-bridge-react";
import { useCallback, useEffect, useState } from "react";
import { fetchProductByIdAction } from "@/features/bundles/actions";
import { useBundleFormMethods, useBundleStore } from "@/features/bundles";
import { useShallow } from "zustand/react/shallow";

/**
 * Hook for managing bundle product creation state
 */
export function useBundleProduct(mode: "create" | "edit") {
    const { setValue } = useBundleFormMethods();
    const { control } = useFormContext();
    const {
        bundleData,
        pendingMedia,
        existingMedia,
        removedMediaIds,
        addPendingFiles,
        setExistingMedia,
        removeExistingMedia,
        removePendingMedia,
        clearPendingMedia,
        setPendingProductDeletion,
        hasLoadedProduct,
        hasManuallyEditedTitle,
        setHasLoadedProduct,
        setHasManuallyEditedTitle,
        markDirty,
        markFieldTouched,
    } = useBundleStore(
        useShallow((s) => ({
            bundleData: s.bundleData,
            pendingMedia: s.pendingMedia,
            existingMedia: s.existingMedia,
            removedMediaIds: s.removedMediaIds,
            addPendingFiles: s.addPendingFiles,
            setExistingMedia: s.setExistingMedia,
            removeExistingMedia: s.removeExistingMedia,
            removePendingMedia: s.removePendingMedia,
            clearPendingMedia: s.clearPendingMedia,
            setPendingProductDeletion: s.setPendingProductDeletion,
            hasLoadedProduct: s.hasLoadedProduct,
            hasManuallyEditedTitle: s.hasManuallyEditedTitle,
            setHasLoadedProduct: s.setHasLoadedProduct,
            setHasManuallyEditedTitle: s.setHasManuallyEditedTitle,
            markDirty: s.markDirty,
            markFieldTouched: s.markFieldTouched,
        })),
    );
    const { trigger } = useFormContext();
    const { openModal } = useModalStore();
    const app = useAppBridge();

    const bundleName = useWatch({ control, name: "name" });
    const createProduct = useWatch({ control, name: "createProduct" });
    const productTitle = useWatch({ control, name: "productTitle" });
    const productDescription = useWatch({ control, name: "productDescription" });
    const mainProductId = bundleData.mainProductId;

    const [isEnabled, setIsEnabled] = useState<boolean>(() => {
        if (mode === "create") {
            return createProduct ?? true;
        }

        return createProduct ?? !!mainProductId;
    });

    const [isUploading, setIsUploading] = useState<boolean>(false);
    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
    const [isLoadingProduct, setIsLoadingProduct] = useState<boolean>(false);
    const [shopDomain, setShopDomain] = useState<string>("");

    // Sync isEnabled with form value when it changes
    useEffect(() => {
        if (createProduct !== undefined) {
            setIsEnabled(createProduct);
        }
    }, [createProduct]);

    // Get shop domain from App Bridge config
    useEffect(() => {
        const config = app.config;
        if (config?.shop) {
            setShopDomain(config.shop);
        }
    }, [app]);

    // Fetch product data in edit mode (once, persists across step changes)
    useEffect(() => {
        if (hasLoadedProduct) return;

        if (mode === "edit" && mainProductId && isEnabled) {
            const loadProduct = async () => {
                setIsLoadingProduct(true);
                try {
                    const sessionToken = await app.idToken();
                    const product = await fetchProductByIdAction(
                        sessionToken,
                        mainProductId,
                    );

                    if (product) {
                        setValue("productTitle", product.title, {
                            shouldValidate: false,
                            shouldDirty: false,
                        });

                        setValue(
                            "productDescription",
                            product.descriptionHtml,
                            {
                                shouldValidate: false,
                                shouldDirty: false,
                            },
                        );

                        // Update snapshot with actual Shopify product title/description
                        const {
                            savedProductSnapshot,
                            setSavedProductSnapshot,
                        } = useBundleStore.getState();
                        if (savedProductSnapshot) {
                            setSavedProductSnapshot({
                                ...savedProductSnapshot,
                                title: product.title || "",
                                description: product.descriptionHtml || "",
                            });
                        }

                        if (product.media && product.media.length > 0) {
                            setExistingMedia(product.media);
                        }

                        setHasLoadedProduct(true);
                    }
                } catch (error) {
                    console.error("Failed to fetch product:", error);
                } finally {
                    setIsLoadingProduct(false);
                }
            };

            void loadProduct();
        }
    }, [
        hasLoadedProduct,
        mode,
        mainProductId,
        isEnabled,
        app,
        setValue,
        setExistingMedia,
        setHasLoadedProduct,
    ]);

    // Initialize createProduct field on mount
    useEffect(() => {
        if (createProduct === undefined) {
            const defaultValue = mode === "create" ? true : !!mainProductId;
            setValue("createProduct", defaultValue, {
                shouldValidate: false,
                shouldDirty: false,
            });
            setIsEnabled(defaultValue);
        }
    }, [createProduct, setValue, mode, mainProductId]);

    // Auto-sync title in creation mode only (unless user has manually edited)
    useEffect(() => {
        if (
            mode === "create" &&
            isEnabled &&
            bundleName &&
            !hasManuallyEditedTitle
        ) {
            setValue("productTitle", bundleName, {
                shouldValidate: false,
                shouldDirty: true,
            });
        }
    }, [mode, bundleName, isEnabled, hasManuallyEditedTitle, setValue]);

    // Clear fields when disabled
    useEffect(() => {
        if (!isEnabled) {
            setValue("productTitle", "", { shouldValidate: false });
            setValue("productDescription", "", { shouldValidate: false });
            clearPendingMedia();
            setExistingMedia([]);
            setHasLoadedProduct(false);
            setHasManuallyEditedTitle(false);
        }
    }, [
        isEnabled,
        setValue,
        clearPendingMedia,
        setExistingMedia,
        setHasLoadedProduct,
        setHasManuallyEditedTitle,
    ]);

    /**
     * Toggle bundle as a product
     */
    const toggleEnabled = useCallback(
        (checked: boolean) => {
            setIsEnabled(checked);
            setValue("createProduct", checked, {
                shouldValidate: false,
                shouldDirty: true,
            });
            markDirty();
            triggerSaveBar();
        },
        [setValue, markDirty],
    );

    /**
     * Handle switch toggle - show confirmation if turning OFF with an existing product
     */
    const handleToggle = useCallback(
        (checked: boolean) => {
            if (!checked && mainProductId) {
                openModal({
                    type: "delete-product",
                    productTitle: productTitle || bundleName,
                    onConfirm: async () => {
                        setPendingProductDeletion(true);
                        toggleEnabled(false);
                    },
                });

                return;
            }

            if (checked && !productTitle && bundleName) {
                setValue("productTitle", bundleName, {
                    shouldValidate: false,
                    shouldDirty: true,
                });
            }

            toggleEnabled(checked);
            setPendingProductDeletion(false);
        },
        [
            mainProductId,
            productTitle,
            bundleName,
            openModal,
            setPendingProductDeletion,
            toggleEnabled,
            setValue,
        ],
    );

    /**
     * Handle title change (manual override)
     */
    const handleTitleChange = useCallback(
        (value: string) => {
            setHasManuallyEditedTitle(true);
            const truncated = value.slice(0, 120);
            setValue("productTitle", truncated, {
                shouldValidate: true,
                shouldDirty: true,
            });
            markDirty();
            triggerSaveBar();
        },
        [setValue, markDirty, setHasManuallyEditedTitle],
    );

    /**
     * Handle description change
     */
    const handleDescriptionChange = useCallback(
        (value: string) => {
            setValue("productDescription", value, {
                shouldValidate: true,
                shouldDirty: true,
            });
            markDirty();
            triggerSaveBar();
        },
        [setValue, markDirty],
    );

    /**
     * Handle new media file upload (adds to pending media)
     */
    const handleMediaUpload = useCallback(
        async (files: File[]) => {
            if (files.length === 0) return;

            // Validate file size (max 20MB per Shopify docs) and type
            const MAX_FILE_SIZE = 20 * 1024 * 1024;
            const ALLOWED_TYPES = [
                "image/jpeg",
                "image/png",
                "image/webp",
                "image/gif",
                "image/heic",
                "image/heif",
            ];

            const invalidFiles = files.filter((file) => {
                if (file.size > MAX_FILE_SIZE) return true;
                if (!ALLOWED_TYPES.includes(file.type)) return true;
                return false;
            });

            if (invalidFiles.length > 0) {
                if (typeof shopify !== "undefined" && shopify.toast?.show) {
                    shopify.toast.show(
                        invalidFiles.length === 1
                            ? "File too large or invalid type. Max 20MB. Allowed: JPEG, PNG, WebP, GIF, HEIC"
                            : `${invalidFiles.length} files too large or invalid type. Max 20MB. Allowed: JPEG, PNG, WebP, GIF, HEIC`,
                        { isError: true },
                    );
                }
                return;
            }

            setIsUploading(true);

            try {
                // Check for duplicates before adding
                const existingKeys = new Set(
                    pendingMedia
                        .filter(
                            (item): item is typeof item & { type: "file" } =>
                                item.type === "file",
                        )
                        .map(
                            (item) =>
                                `${item.file.name}_${item.file.size}_${item.file.lastModified}`,
                        ),
                );
                const duplicateCount = files.filter((file) =>
                    existingKeys.has(
                        `${file.name}_${file.size}_${file.lastModified}`,
                    ),
                ).length;

                await new Promise((resolve) => setTimeout(resolve, 300));
                addPendingFiles(files);

                if (duplicateCount > 0) {
                    if (typeof shopify !== "undefined" && shopify.toast?.show) {
                        shopify.toast.show("Duplicate image(s) already added", {
                            isError: true,
                            duration: 3000,
                        });
                    }
                }
            } catch (error) {
                console.error("Failed to add media:", error);
            } finally {
                setIsUploading(false);
            }
        },
        [addPendingFiles, pendingMedia],
    );

    /**
     * Remove an existing media (from Shopify)
     */
    const handleRemoveExistingMedia = useCallback(
        (id: string) => {
            removeExistingMedia(id);
            // Note: removeExistingMedia in store already calls triggerSaveBar
        },
        [removeExistingMedia],
    );

    /**
     * Set hovered media item
     */
    const setHoveredItem = useCallback((index: number | null) => {
        setHoveredIndex(index);
    }, []);

    /**
     * Get Shopify product edit URL
     */
    const getProductEditUrl = useCallback(() => {
        if (!mainProductId) {
            return null;
        }

        const match = mainProductId.match(/\/Product\/(\d+)$/);
        const numericId = match ? match[1] : null;

        if (!numericId) {
            return null;
        }

        return `https://${shopDomain}/admin/products/${numericId}`;
    }, [mainProductId, shopDomain]);

    // Filter out removed media before returning
    const visibleExistingMedia = existingMedia.filter(
        (media) => !removedMediaIds.includes(media.id),
    );

    /**
     * Handle title blur — marks field as touched and triggers validation.
     */
    const handleTitleBlur = useCallback(() => {
        markFieldTouched("productTitle");
        void trigger("productTitle");
    }, [markFieldTouched, trigger]);

    /**
     * Handle description blur — marks field as touched and triggers validation.
     */
    const handleDescriptionBlur = useCallback(() => {
        markFieldTouched("productDescription");
        void trigger("productDescription");
    }, [markFieldTouched, trigger]);

    return {
        isEnabled,
        bundleName,
        productTitle: productTitle || "",
        productDescription: productDescription || "",
        pendingMedia,
        existingMedia: visibleExistingMedia,
        isUploading,
        isLoadingProduct,
        hoveredIndex,
        mainProductId,
        handleToggle,
        toggleEnabled,
        handleTitleChange,
        handleDescriptionChange,
        handleTitleBlur,
        handleDescriptionBlur,
        handleMediaUpload,
        handleRemoveExistingMedia,
        removePendingMedia,
        setHoveredItem,
        getProductEditUrl,
    };
}
