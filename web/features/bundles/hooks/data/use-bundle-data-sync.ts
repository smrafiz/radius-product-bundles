"use client";

import { useEffect } from "react";
import { useBundleStore } from "@/features/bundles";

/**
 * Hook to sync query data to Zustand store
 */
export function useBundleDataSync(bundleData: any | undefined) {
    const { setBundleData, setSavedProductSnapshot } = useBundleStore();

    useEffect(() => {
        if (bundleData) {
            // Snapshot product-relevant fields for skip-if-unchanged optimization
            if (bundleData.mainProductId) {
                // Preserve Shopify-sourced title/description if already loaded;
                // only use bundleData.name as provisional fallback on first load.
                const existing = useBundleStore.getState().savedProductSnapshot;
                setSavedProductSnapshot({
                    title: existing ? existing.title : (bundleData.name || ""),
                    description: existing ? existing.description : (bundleData.description || ""),
                    status: bundleData.status || "DRAFT",
                    discountType: bundleData.discountType || "PERCENTAGE",
                    discountValue: bundleData.discountValue ?? 0,
                    maxDiscountAmount: bundleData.maxDiscountAmount ?? null,
                    productIds: (bundleData.products || []).map((p: any) => p.id).sort(),
                });
            }

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
