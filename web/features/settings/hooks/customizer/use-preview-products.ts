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
        console.log(
            "[usePreviewProducts] customizerSource:",
            customizerSource,
            "previewProducts:",
            previewProducts.length,
            "placeholders:",
            placeholderProducts.length,
        );

        if (
            customizerSource === "bundle-preview" &&
            previewProducts.length > 0
        ) {
            const result = maxCount
                ? previewProducts.slice(0, maxCount)
                : previewProducts;
            console.log(
                "[usePreviewProducts] returning preview products:",
                result.length,
            );
            return result;
        }

        const result = maxCount
            ? placeholderProducts.slice(0, maxCount)
            : placeholderProducts;
        console.log(
            "[usePreviewProducts] returning placeholder products:",
            result.length,
        );
        return result;
    }, [previewProducts, customizerSource, placeholderProducts, maxCount]);
}
