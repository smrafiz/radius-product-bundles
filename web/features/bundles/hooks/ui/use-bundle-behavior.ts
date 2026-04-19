"use client";

import { triggerSaveBar } from "@/shared";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
    DiscountApplication,
    useBundleFormMethods,
    useBundleStore,
} from "@/features/bundles";
import { useShallow } from "zustand/react/shallow";

/**
 * Hook for managing bundle behavior state and actions
 */
export function useBundleBehavior() {
    const {
        selectedItems,
        bundleData,
        setBundleData,
        markDirty,
        markFieldTouched,
    } = useBundleStore(
        useShallow((s) => ({
            selectedItems: s.selectedItems,
            bundleData: s.bundleData,
            setBundleData: s.setBundleData,
            markDirty: s.markDirty,
            markFieldTouched: s.markFieldTouched,
        })),
    );
    const { setValue } = useBundleFormMethods();

    const [discountApplication, setDiscountApplication] =
        useState<DiscountApplication>(
            bundleData.discountApplication || DiscountApplication.BUNDLE,
        );
    const [discountedProductIds, setDiscountedProductIds] = useState<
        Set<string>
    >(new Set(bundleData.discountedProductIds || []));
    const [freeShipping, setFreeShipping] = useState<boolean>(
        bundleData.freeShipping || false,
    );
    const [selectedProducts, setSelectedProducts] = useState<Set<string>>(
        new Set(),
    );

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
    }, [
        bundleData.discountApplication,
        bundleData.discountedProductIds,
        bundleData.freeShipping,
    ]);

    /**
     * Reset to "bundle" when NO_DISCOUNT is selected
     */
    useEffect(() => {
        if (isDiscountDisabled && discountApplication === DiscountApplication.PRODUCTS) {
            setDiscountApplication(DiscountApplication.BUNDLE);
            setDiscountedProductIds(new Set());
            setBundleData({
                discountApplication: DiscountApplication.BUNDLE,
                discountedProductIds: [],
            });
            setValue("discountApplication", DiscountApplication.BUNDLE, {
                shouldValidate: true,
            });
            setValue("discountedProductIds", [], { shouldValidate: true });
        }
    }, [isDiscountDisabled, discountApplication, setBundleData, setValue]);

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
            setSelectedProducts(
                new Set(uniqueProducts.map((p) => p.productId)),
            );
        }
    }, [selectedProducts.size, uniqueProducts]);

    /**
     * Confirm product selection
     */
    const handleConfirm = useCallback(() => {
        if (selectedProducts.size === 0) {
            setDiscountApplication(DiscountApplication.BUNDLE);
            setDiscountedProductIds(new Set());
            setBundleData({
                discountApplication: DiscountApplication.BUNDLE,
                discountedProductIds: [],
            });
            setValue("discountApplication", DiscountApplication.BUNDLE, {
                shouldValidate: true,
            });
            setValue("discountedProductIds", [], { shouldValidate: true });
        } else {
            const ids = Array.from(selectedProducts);
            setDiscountedProductIds(new Set(selectedProducts));
            setBundleData({
                discountApplication: DiscountApplication.PRODUCTS,
                discountedProductIds: ids,
            });
            setValue("discountApplication", DiscountApplication.PRODUCTS, {
                shouldValidate: true,
            });
            setValue("discountedProductIds", ids, { shouldValidate: true });
        }
        setSelectedProducts(new Set());
        markFieldTouched("discountApplication");
        markDirty();
        triggerSaveBar();
    }, [
        selectedProducts,
        setBundleData,
        setValue,
        markFieldTouched,
        markDirty,
    ]);

    /**
     * Reset on modal close
     */
    const handleModalHide = useCallback(() => {
        if (
            discountedProductIds.size === 0 &&
            discountApplication === DiscountApplication.PRODUCTS
        ) {
            setDiscountApplication(DiscountApplication.BUNDLE);
        }
        setSelectedProducts(new Set());
    }, [discountedProductIds.size, discountApplication]);

    /**
     * Handle radio change
     */
    const handleRadioChange = useCallback(
        (value: string) => {
            if (isDiscountDisabled) {
                return;
            }

            const newValue = value as DiscountApplication;
            setDiscountApplication(newValue);
            setValue("discountApplication", newValue, {
                shouldValidate: true,
            });
            markFieldTouched("discountApplication");

            if (newValue === DiscountApplication.BUNDLE) {
                setDiscountedProductIds(new Set());
                setBundleData({
                    discountApplication: DiscountApplication.BUNDLE,
                    discountedProductIds: [],
                });
                setValue("discountedProductIds", [], {
                    shouldValidate: true,
                });
            }
            markDirty();
            triggerSaveBar();
        },
        [
            isDiscountDisabled,
            setBundleData,
            setValue,
            markFieldTouched,
            markDirty,
        ],
    );

    /**
     * Handle free shipping toggle
     */
    const handleFreeShippingChange = useCallback(
        (checked: boolean) => {
            setFreeShipping(checked);
            setBundleData({ freeShipping: checked });
            setValue("freeShipping", checked, { shouldValidate: true });
            markFieldTouched("freeShipping");
            markDirty();
            triggerSaveBar();
        },
        [setBundleData, setValue, markFieldTouched, markDirty],
    );

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
