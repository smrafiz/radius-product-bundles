"use client";

import { PreviewProduct } from "@/shared";
import { useCustomizerStore } from "@/features/settings";
import { useMemo } from "react";

interface UsePreviewProductsOptions {
    placeholderProducts: PreviewProduct[];
    maxCount?: number;
}

export function usePreviewProducts({
    placeholderProducts,
    maxCount,
}: UsePreviewProductsOptions): PreviewProduct[] {
    const { previewProducts, customizerSource } = useCustomizerStore();

    return useMemo(() => {
        if (
            customizerSource === "bundle-preview" &&
            previewProducts.length > 0
        ) {
            const result = maxCount
                ? previewProducts.slice(0, maxCount)
                : previewProducts;
            return result;
        }

        const result = maxCount
            ? placeholderProducts.slice(0, maxCount)
            : placeholderProducts;
        return result;
    }, [previewProducts, customizerSource, placeholderProducts, maxCount]);
}
