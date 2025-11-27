"use client";

import { useState } from "react";
import { useBundleStore } from "@/features/bundles";

/**
 * Hook to handle adding media from product images
 */
export function useProductMediaPicker() {
    const [isLoading, setIsLoading] = useState(false);
    const { mediaFiles, setMediaFiles } = useBundleStore();

    /**
     * Convert image URL to a File object
     */
    const urlToFile = async (
        url: string,
        filename: string,
    ): Promise<File | null> => {
        try {
            const response = await fetch(url);
            const blob = await response.blob();
            const extension = blob.type.split("/")[1] || "jpg";
            return new File([blob], `${filename}.${extension}`, {
                type: blob.type,
            });
        } catch (error) {
            console.error(`Failed to fetch image: ${url}`, error);
            return null;
        }
    };

    /**
     * Add selected images to media files
     */
    const addImages = async (imageUrls: string[]) => {
        if (imageUrls.length === 0) return;

        setIsLoading(true);

        try {
            const filePromises = imageUrls.map((url, index) =>
                urlToFile(url, `product-image-${Date.now()}-${index}`),
            );

            const files = await Promise.all(filePromises);
            const validFiles = files.filter((f): f is File => f !== null);

            if (validFiles.length > 0) {
                setMediaFiles([...(mediaFiles || []), ...validFiles]);
            }
        } catch (error) {
            console.error("Failed to add images:", error);
        } finally {
            setIsLoading(false);
        }
    };

    return {
        isLoading,
        addImages,
    };
}