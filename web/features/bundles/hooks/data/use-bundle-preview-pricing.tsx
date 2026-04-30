import { useMemo } from "react";
import {
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
    const { bundleData, selectedItems, variantDataMap } = useBundleStore(
        useShallow((s) => ({ bundleData: s.bundleData, selectedItems: s.selectedItems, variantDataMap: s.variantDataMap })),
    );
    const isBxgy =
        bundleData.type === "BOGO" || bundleData.type === "BUY_X_GET_Y";

    return useMemo(() => {
        if (!selectedItems.length) {
            return {
                originalPrice: 0,
                discountAmount: 0,
                finalPrice: 0,
                savingsPercentage: 0,
                hasDiscount: false,
            };
        }

        const round = (n: number) => Math.round(n * 100) / 100;

        // For multi-variant items, sum actual per-variant prices from variantDataMap.
        // Falls back to item.price × count if map data is unavailable.
        const getItemOriginalPrice = (item: (typeof selectedItems)[0]): number => {
            const vids = item.variantIds ?? [];
            if (vids.length <= 1) return (parseFloat(item.price) || 0) * item.quantity;
            // Sum each selected variant's real price
            const variantSum = vids.reduce((s, vid) => {
                const vData = variantDataMap[vid] ?? item.variants?.find((v) => v.id === vid);
                const vPrice = parseFloat(vData?.price || "") || parseFloat(item.price) || 0;
                return s + vPrice;
            }, 0);
            return round(variantSum) * item.quantity;
        };

        // Compute original price accounting for per-variant prices
        const originalPrice = round(
            selectedItems.reduce((sum, item) => sum + getItemOriginalPrice(item), 0),
        );

        if (!bundleData.discountType) {
            return {
                originalPrice,
                discountAmount: 0,
                finalPrice: originalPrice,
                savingsPercentage: 0,
                hasDiscount: false,
            };
        }

        // BOGO/BXGY: discount applies only to reward products
        if (isBxgy) {
            const rewardItems = selectedItems.filter(
                (i) => i.role === "REWARD",
            );
            // Reward price using per-variant actual prices
            const rewardPrice = round(
                rewardItems.reduce((sum, item) => sum + getItemOriginalPrice(item), 0),
            );
            const discountValue = bundleData.discountValue ?? 0;
            // Total reward units = sum of (quantity × variantCount) per reward item
            const rewardUnitCount = rewardItems.reduce((sum, i) => {
                const vids = i.variantIds ?? [];
                return sum + (i.quantity ?? 1) * (vids.length > 1 ? vids.length : 1);
            }, 0);

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
                            Math.min(discountValue * rewardUnitCount, rewardPrice),
                        );
                        break;
                    case "CUSTOM_PRICE":
                        discountAmount = round(
                            Math.max(0, rewardPrice - discountValue * rewardUnitCount),
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

        const discountablePrice = round(
            discountableItems.reduce((sum, item) => sum + getItemOriginalPrice(item), 0),
        );

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
        variantDataMap,
        isBxgy,
        bundleData.discountType,
        bundleData.discountValue,
        bundleData.discountApplication,
        bundleData.discountedProductIds,
        bundleData.maxDiscountAmount,
    ]);
}
