"use client";

import {
    fetchProductById,
    useBundleFormMethods,
    useBundleStore,
} from "@/features/bundles";
import { useCallback, useEffect, useState } from "react";
import { useAppBridge } from "@shopify/app-bridge-react";

/**
 * Hook for managing bundle product creation state
 * Handles product fields, media upload, and toggle state
 */
export function useBundleProduct(mode: "create" | "edit") {
    const { watch, setValue } = useBundleFormMethods();
    const { bundleData } = useBundleStore();
    const app = useAppBridge();

    const bundleName = watch("name");
    const createProduct = watch("createProduct");
    const productTitle = watch("productTitle");
    const productDescription = watch("productDescription");
    const mainProductId = bundleData.mainProductId;

    const [isEnabled, setIsEnabled] = useState<boolean>(
        createProduct !== undefined ? createProduct : true,
    );
    const [mediaFiles, setMediaFiles] = useState<File[]>([]);
    const [isUploading, setIsUploading] = useState<boolean>(false);
    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
    const [isLoadingProduct, setIsLoadingProduct] = useState<boolean>(false);
    const [shopDomain, setShopDomain] = useState<string>("");

    // Get shop domain from App Bridge config
    useEffect(() => {
        const config = app.config;
        if (config?.shop) {
            setShopDomain(config.shop);
        }
    }, [app]);

    // Fetch product data in edit mode
    useEffect(() => {
        if (mode === "edit" && mainProductId && isEnabled) {
            const loadProduct = async () => {
                setIsLoadingProduct(true);
                try {
                    const sessionToken = await app.idToken();
                    const product = await fetchProductById(
                        sessionToken,
                        mainProductId
                    );

                    if (product) {
                        // Set title
                        setValue("productTitle", product.title, {
                            shouldValidate: false,
                            shouldDirty: false,
                        });

                        setValue("productDescription", product.descriptionHtml, {
                            shouldValidate: false,
                            shouldDirty: false,
                        });
                    }
                } catch (error) {
                    console.error("Failed to fetch product:", error);
                } finally {
                    setIsLoadingProduct(false);
                }
            };

            void loadProduct();
        }
    }, [mode, mainProductId, isEnabled, app, setValue]);

    // Initialize createProduct field on mount
    useEffect(() => {
        if (createProduct === undefined) {
            setValue("createProduct", true, {
                shouldValidate: false,
                shouldDirty: false,
            });
        }
    }, [createProduct, setValue]);

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
            setMediaFiles([]);
        }
    }, [isEnabled, setValue]);

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
        },
        [setValue],
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
        },
        [setValue],
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
        },
        [setValue],
    );

    /**
     * Handle media file upload
     */
    const handleMediaUpload = useCallback(async (files: File[]) => {
        if (files.length === 0) return;

        setIsUploading(true);

        try {
            await new Promise((resolve) => setTimeout(resolve, 400));
            setMediaFiles((prev) => [...prev, ...files]);
        } catch (error) {
            console.error("Failed to upload media:", error);
        } finally {
            setIsUploading(false);
        }
    }, []);

    /**
     * Remove media file
     */
    const removeMediaFile = useCallback((index: number) => {
        setMediaFiles((prev) => prev.filter((_, i) => i !== index));
    }, []);

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
        if (!mainProductId) return null;

        const match = mainProductId.match(/\/Product\/(\d+)$/);
        const numericId = match ? match[1] : null;

        if (!numericId) {
            return null;
        }

        return `https://${shopDomain}/admin/products/${numericId}`;
    }, [mainProductId]);

    return {
        isEnabled,
        bundleName,
        productTitle: productTitle || bundleName,
        productDescription: productDescription || "",
        mediaFiles,
        isUploading,
        isLoadingProduct,
        hoveredIndex,
        mainProductId,
        toggleEnabled,
        handleTitleChange,
        handleDescriptionChange,
        handleMediaUpload,
        removeMediaFile,
        setHoveredItem,
        getProductEditUrl,
    };
}
