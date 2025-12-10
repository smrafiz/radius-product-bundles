"use client";

import { useState } from "react";
import { useBundleStore } from "@/features/bundles";

/**
 * Hook to handle adding media from product images
 */
export function useProductMediaPicker() {
    const [isLoading, setIsLoading] = useState(false);
    const { addPendingUrls } = useBundleStore();

    /**
     * Add selected images
     */
    const addImages = (imageUrls: string[]) => {
        if (imageUrls.length === 0) {
            return;
        }

        setIsLoading(true);

        try {
            addPendingUrls(imageUrls);
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
