"use client";

import { useEffect } from "react";
import { useBundleStore } from "@/features/bundles";

/**
 * Hook to sync query data to Zustand store
 */
export function useBundleDataSync(bundleData: any | undefined) {
    const { setBundleData } = useBundleStore();

    useEffect(() => {
        if (bundleData) {
            setBundleData({
                id: bundleData.id,
                name: bundleData.name,
                type: bundleData.type,
                description: bundleData.description,

                // Main product
                mainProductId: bundleData.mainProductId,
                mainVariantId: bundleData.mainVariantId,
                createProduct: !!bundleData.mainProductId,
                productTitle: bundleData.name,
                productDescription: bundleData.description || "",

                // Discount settings
                discountType: bundleData.discountType,
                discountValue: bundleData.discountValue,
                minOrderValue: bundleData.minOrderValue,
                maxDiscountAmount: bundleData.maxDiscountAmount,

                // Products
                products: bundleData.products || [],
                productGroups: bundleData.productGroups || [],

                // Settings
                settings: bundleData.settings,

                // Mix & Match
                allowMixAndMatch: bundleData.allowMixAndMatch,
                mixAndMatchPrice: bundleData.mixAndMatchPrice,

                // Buy X Get Y
                buyQuantity: bundleData.buyQuantity,
                getQuantity: bundleData.getQuantity,

                // Volume Discount
                volumeTiers: bundleData.volumeTiers,

                // Scheduling
                startDate: bundleData.startDate,
                endDate: bundleData.endDate,

                // Priority
                priority: bundleData.priority ?? 0,

                // Images
                images: bundleData.images || [],
            });
        }
    }, [bundleData, setBundleData]);
}
