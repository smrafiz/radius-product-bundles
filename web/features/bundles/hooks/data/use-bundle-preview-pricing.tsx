import { useMemo } from "react";
import {
    calculateBundlePrice,
    calculateDiscountAmount,
    calculateSavingsPercentage,
    DiscountApplication,
    useBundlePreviewPricingProps,
    useBundleStore,
} from "@/features/bundles";
import { useShallow } from "zustand/react/shallow";

/**
 * Hook for calculating bundle preview pricing
 */
export function useBundlePreviewPricing(): useBundlePreviewPricingProps {
    const { bundleData, selectedItems } = useBundleStore(
        useShallow((s) => ({ bundleData: s.bundleData, selectedItems: s.selectedItems })),
    );
    const isBxgy =
        bundleData.type === "BOGO" || bundleData.type === "BUY_X_GET_Y";

    return useMemo(() => {
        if (!selectedItems.length || !bundleData.discountType) {
            return {
                originalPrice: 0,
                discountAmount: 0,
                finalPrice: 0,
                savingsPercentage: 0,
                hasDiscount: false,
            };
        }

        const round = (n: number) => Math.round(n * 100) / 100;
        const originalPrice = round(calculateBundlePrice(selectedItems));

        // BOGO/BXGY: discount applies only to reward products
        if (isBxgy) {
            const rewardItems = selectedItems.filter(
                (i) => i.role === "REWARD",
            );
            const rewardPrice = round(calculateBundlePrice(rewardItems));
            const discountValue = bundleData.discountValue ?? 0;

            let discountAmount = 0;
            if (discountValue > 0) {
                switch (bundleData.discountType) {
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

            const finalPrice = round(
                Math.max(0, originalPrice - discountAmount),
            );
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
        }

        // FIXED_BUNDLE: existing logic
        const applyToSpecific = bundleData.discountApplication === DiscountApplication.PRODUCTS;
        const discountedIds = new Set(bundleData.discountedProductIds ?? []);

        const discountableItems = applyToSpecific
            ? selectedItems.filter((item) => discountedIds.has(item.productId))
            : selectedItems;

        const discountablePrice = calculateBundlePrice(discountableItems);

        if (bundleData.discountType === "CUSTOM_PRICE") {
            const customPrice = bundleData.discountValue ?? 0;
            const nonDiscountablePrice = originalPrice - discountablePrice;
            const finalPrice = nonDiscountablePrice + customPrice;
            const discountAmount = Math.max(0, discountablePrice - customPrice);
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
        }

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
            discountablePrice,
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
        isBxgy,
        bundleData.discountType,
        bundleData.discountValue,
        bundleData.discountApplication,
        bundleData.discountedProductIds,
        bundleData.maxDiscountAmount,
    ]);
}
