"use client";

import { useFormContext } from "react-hook-form";
import { triggerSaveBar, useModalStore } from "@/shared";
import { useAppBridge } from "@shopify/app-bridge-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { fetchProductByIdAction } from "@/features/bundles/actions";
import { useBundleFormMethods, useBundleStore } from "@/features/bundles";

/**
 * Hook for managing bundle product creation state
 */
export function useBundleProduct(mode: "create" | "edit") {
    const { watch, setValue } = useBundleFormMethods();
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
        markDirty,
        markFieldTouched,
    } = useBundleStore();
    const { trigger } = useFormContext();
    const { openModal } = useModalStore();
    const app = useAppBridge();

    const bundleName = watch("name");
    const createProduct = watch("createProduct");
    const productTitle = watch("productTitle");
    const productDescription = watch("productDescription");
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

    // Track if product data has been loaded to prevent re-fetching
    const hasLoadedProductRef = useRef<boolean>(false);

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

    // Fetch product data in edit mode
    useEffect(() => {
        if (hasLoadedProductRef.current) {
            return;
        }

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

                        if (product.media && product.media.length > 0) {
                            setExistingMedia(product.media);
                        }

                        hasLoadedProductRef.current = true;
                    }
                } catch (error) {
                    console.error("Failed to fetch product:", error);
                } finally {
                    setIsLoadingProduct(false);
                }
            };

            void loadProduct();
        }
    }, [mode, mainProductId, isEnabled, app, setValue, setExistingMedia]);

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

    // Auto-sync title in creation mode only
    useEffect(() => {
        if (mode === "create" && isEnabled && bundleName) {
            setValue("productTitle", bundleName, {
                shouldValidate: false,
                shouldDirty: true,
            });
        }
    }, [mode, bundleName, isEnabled, setValue]);

    // Clear fields when disabled
    useEffect(() => {
        if (!isEnabled) {
            setValue("productTitle", "", { shouldValidate: false });
            setValue("productDescription", "", { shouldValidate: false });
            clearPendingMedia();
            setExistingMedia([]);
            hasLoadedProductRef.current = false;
        }
    }, [isEnabled, setValue, clearPendingMedia, setExistingMedia]);

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
            const truncated = value.slice(0, 120);
            setValue("productTitle", truncated, {
                shouldValidate: true,
                shouldDirty: true,
            });
            markDirty();
            triggerSaveBar();
        },
        [setValue, markDirty],
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

            setIsUploading(true);

            try {
                await new Promise((resolve) => setTimeout(resolve, 300));
                addPendingFiles(files);
                console.log(
                    `Added ${files.length} new files to pending media.`,
                );
                // Note: addPendingFiles in store already calls triggerSaveBar
            } catch (error) {
                console.error("Failed to add media:", error);
            } finally {
                setIsUploading(false);
            }
        },
        [addPendingFiles],
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
        productTitle: productTitle || bundleName,
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
