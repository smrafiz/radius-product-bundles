import { useMemo } from "react";

import {
    calculateBundlePrice,
    calculateDiscountAmount,
    calculateSavingsPercentage,
    useBundlePreviewPricingProps,
    useBundleStore,
} from "@/features/bundles";

/**
 * Hook for calculating bundle preview pricing
 */
export function useBundlePreviewPricing(): useBundlePreviewPricingProps {
    const { bundleData, selectedItems } = useBundleStore();

    return useMemo(() => {
        // Return placeholder values when no items or discount configured
        if (!selectedItems.length || !bundleData.discountType) {
            return {
                originalPrice: 0,
                discountAmount: 0,
                finalPrice: 0,
                savingsPercentage: 0,
                hasDiscount: false,
            };
        }

        const originalPrice = calculateBundlePrice(selectedItems);

        // Handle CUSTOM_PRICE
        if (bundleData.discountType === "CUSTOM_PRICE") {
            const customPrice = bundleData.discountValue ?? 0;
            const discountAmount = Math.max(0, originalPrice - customPrice);
            const savingsPercentage = calculateSavingsPercentage(
                originalPrice,
                customPrice,
            );

            return {
                originalPrice,
                discountAmount,
                finalPrice: customPrice,
                savingsPercentage,
                hasDiscount: discountAmount > 0,
            };
        }

        // Handle other discount types
        if (!bundleData.discountValue) {
            return {
                originalPrice,
                discountAmount: 0,
                finalPrice: originalPrice,
                savingsPercentage: 0,
                hasDiscount: false,
            };
        }

        const discountAmount = calculateDiscountAmount(
            originalPrice,
            bundleData.discountType,
            bundleData.discountValue,
            bundleData.maxDiscountAmount,
        );
        const finalPrice = Math.max(0, originalPrice - discountAmount);
        const savingsPercentage = calculateSavingsPercentage(
            originalPrice,
            finalPrice,
        );

        return {
            originalPrice,
            discountAmount,
            finalPrice,
            savingsPercentage,
            hasDiscount: discountAmount > 0,
        };
    }, [
        selectedItems,
        bundleData.discountType,
        bundleData.discountValue,
        bundleData.maxDiscountAmount,
    ]);
}
