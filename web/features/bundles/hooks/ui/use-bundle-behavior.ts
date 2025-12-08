"use client";

import { triggerSaveBar } from "@/shared";
import { useCallback, useEffect, useMemo, useState } from "react";
import { DiscountApplication, useBundleStore } from "@/features/bundles";

/**
 * Hook for managing bundle behavior state and actions
 */
export function useBundleBehavior() {
    const { selectedItems, bundleData, setBundleData, markDirty } = useBundleStore();

    const [discountApplication, setDiscountApplication] = useState<DiscountApplication>(
        bundleData.discountApplication || "bundle"
    );
    const [discountedProductIds, setDiscountedProductIds] = useState<Set<string>>(
        new Set(bundleData.discountedProductIds || [])
    );
    const [freeShipping, setFreeShipping] = useState<boolean>(
        bundleData.freeShipping || false
    );
    const [selectedProducts, setSelectedProducts] = useState<Set<string>>(new Set());

    /**
     * Check if the discount is disabled (NO_DISCOUNT selected)
     */
    const isDiscountDisabled = bundleData.discountType === "NO_DISCOUNT";

    /**
     * Sync state with bundleData on mount/changes
     */
    useEffect(() => {
        if (bundleData.discountApplication) {
            setDiscountApplication(bundleData.discountApplication);
        }

        if (bundleData.discountedProductIds) {
            setDiscountedProductIds(new Set(bundleData.discountedProductIds));
        }

        if (bundleData.freeShipping !== undefined) {
            setFreeShipping(bundleData.freeShipping);
        }
    }, [bundleData.discountApplication, bundleData.discountedProductIds, bundleData.freeShipping]);

    /**
     * Reset to "bundle" when NO_DISCOUNT is selected
     */
    useEffect(() => {
        if (isDiscountDisabled && discountApplication === "products") {
            setDiscountApplication("bundle");
            setDiscountedProductIds(new Set());
            setBundleData({
                discountApplication: "bundle",
                discountedProductIds: [],
            });
        }
    }, [isDiscountDisabled, discountApplication, setBundleData]);

    /**
     * Get unique products for the modal
     */
    const uniqueProducts = useMemo(() => {
        const seen = new Set<string>();
        return selectedItems.filter((item) => {
            if (seen.has(item.productId)) return false;
            seen.add(item.productId);
            return true;
        });
    }, [selectedItems]);

    /**
     * Toggle product selection
     */
    const toggleProduct = useCallback((productId: string) => {
        setSelectedProducts((prev) => {
            const next = new Set(prev);
            if (next.has(productId)) {
                next.delete(productId);
            } else {
                next.add(productId);
            }
            return next;
        });
    }, []);

    /**
     * Toggle all products
     */
    const toggleAll = useCallback(() => {
        if (selectedProducts.size === uniqueProducts.length) {
            setSelectedProducts(new Set());
        } else {
            setSelectedProducts(new Set(uniqueProducts.map((p) => p.productId)));
        }
    }, [selectedProducts.size, uniqueProducts]);

    /**
     * Confirm product selection
     */
    const handleConfirm = useCallback(() => {
        if (selectedProducts.size === 0) {
            setDiscountApplication("bundle");
            setDiscountedProductIds(new Set());
            setBundleData({
                discountApplication: "bundle",
                discountedProductIds: [],
            });
        } else {
            setDiscountedProductIds(new Set(selectedProducts));
            setBundleData({
                discountApplication: "products",
                discountedProductIds: Array.from(selectedProducts),
            });
        }
        setSelectedProducts(new Set());
        markDirty();
        triggerSaveBar();
    }, [selectedProducts, setBundleData, markDirty]);

    /**
     * Reset on modal close
     */
    const handleModalHide = useCallback(() => {
        if (discountedProductIds.size === 0 && discountApplication === "products") {
            setDiscountApplication("bundle");
        }
        setSelectedProducts(new Set());
    }, [discountedProductIds.size, discountApplication]);

    /**
     * Handle radio change
     */
    const handleRadioChange = useCallback((value: string) => {
        if (isDiscountDisabled) {
            return;
        }

        const newValue = value as DiscountApplication;
        setDiscountApplication(newValue);

        if (newValue === "bundle") {
            setDiscountedProductIds(new Set());
            setBundleData({
                discountApplication: "bundle",
                discountedProductIds: [],
            });
        }
        markDirty();
        triggerSaveBar();
    }, [isDiscountDisabled, setBundleData, markDirty]);

    /**
     * Handle free shipping toggle
     */
    const handleFreeShippingChange = useCallback((checked: boolean) => {
        setFreeShipping(checked);
        setBundleData({ freeShipping: checked });
        markDirty();
        triggerSaveBar();
    }, [setBundleData, markDirty]);

    /**
     * Initialize selection before opening modal
     */
    const handleOpenModal = useCallback(() => {
        setSelectedProducts(new Set(discountedProductIds));
    }, [discountedProductIds]);

    /**
     * Get summary text
     */
    const getSummary = useCallback(() => {
        if (discountedProductIds.size === 0) return "";
        if (discountedProductIds.size === uniqueProducts.length) {
            return `All ${discountedProductIds.size} products`;
        }
        return `${discountedProductIds.size} of ${uniqueProducts.length} products`;
    }, [discountedProductIds.size, uniqueProducts.length]);

    return {
        // State
        discountApplication,
        discountedProductIds,
        freeShipping,
        selectedProducts,
        uniqueProducts,
        isDiscountDisabled,

        // Handlers
        toggleProduct,
        toggleAll,
        handleConfirm,
        handleModalHide,
        handleRadioChange,
        handleFreeShippingChange,
        handleOpenModal,
        getSummary,
    };
}