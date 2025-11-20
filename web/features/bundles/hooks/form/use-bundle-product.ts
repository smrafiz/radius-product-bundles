"use client";

import { useState, useCallback, useEffect } from "react";
import { useBundleFormMethods } from "@/features/bundles";

/**
 * Hook for managing bundle product creation state
 * Handles product fields, media upload, and toggle state
 */
export function useBundleProduct() {
    const { watch, setValue } = useBundleFormMethods();

    const bundleName = watch("name");
    const createProduct = watch("createProduct");
    const productDescription = watch("productDescription");

    const [isEnabled, setIsEnabled] = useState<boolean>(
        createProduct !== undefined ? createProduct : true
    );
    const [mediaFiles, setMediaFiles] = useState<File[]>([]);
    const [isUploading, setIsUploading] = useState<boolean>(false);
    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

    // Initialize createProduct field on mount
    useEffect(() => {
        if (createProduct === undefined) {
            setValue("createProduct", true, {
                shouldValidate: false,
                shouldDirty: false,
            });
        }
    }, [createProduct, setValue]);

    useEffect(() => {
        if (isEnabled && bundleName) {
            setValue("productTitle", bundleName, {
                shouldValidate: false,
                shouldDirty: true,
            });
        }
    }, [bundleName, isEnabled, setValue]);

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
        [setValue]
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
        [setValue]
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
        [setValue]
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

    return {
        isEnabled,
        bundleName,
        productDescription: productDescription || "",
        mediaFiles,
        isUploading,
        hoveredIndex,
        toggleEnabled,
        handleTitleChange,
        handleDescriptionChange,
        handleMediaUpload,
        removeMediaFile,
        setHoveredItem,
    };
}