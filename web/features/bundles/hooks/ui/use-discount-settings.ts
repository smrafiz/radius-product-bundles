"use client";

import { useCallback, useEffect, useMemo } from "react";
import {
    DISCOUNT_TYPES,
    DiscountType,
    getDiscountProperty,
    getDiscountTypesForBundle,
    useBundleField,
    useBundleStore,
    useBundleValidation,
} from "@/features/bundles";
import { getCurrencySymbol, useShopSettings } from "@/shared";

/**
 * Hook for managing discount settings state and actions
 */
export function useDiscountSettings() {
    const { getFieldError } = useBundleValidation();
    const { markDirty, bundleData } = useBundleStore();
    const { isLoading, currencyCode } = useShopSettings();

    // Form fields
    const discountTypeField = useBundleField<string>("discountType");
    const discountValueField = useBundleField<number | undefined>("discountValue");
    const minOrderValueField = useBundleField<number | undefined>("minOrderValue");
    const maxDiscountAmountField = useBundleField<number | undefined>("maxDiscountAmount");

    // Derived values
    const currencySymbol = getCurrencySymbol(currencyCode);
    const bundleType = bundleData.type;

    /**
     * Get filtered discount types based on the bundle type
     */
    const availableDiscountTypes = useMemo(() => {
        return bundleType
            ? getDiscountTypesForBundle(bundleType)
            : Object.values(DISCOUNT_TYPES);
    }, [bundleType]);

    /**
     * Set the default discount type and value on the mount
     */
    useEffect(() => {
        if (!discountTypeField.value) {
            discountTypeField.handleChange("PERCENTAGE");
        }
        if (!discountValueField.value) {
            discountValueField.handleChange(10);
        }
    }, []);

    /**
     * Handle discount type change
     */
    const handleDiscountTypeChange = useCallback((value: string) => {
        discountTypeField.handleChange(value as DiscountType);

        if (value === "CUSTOM_PRICE") {
            maxDiscountAmountField.handleChange(undefined);
        }

        markDirty();
    }, [discountTypeField, maxDiscountAmountField, markDirty]);

    /**
     * Handle discount value change
     */
    const handleDiscountValueChange = useCallback((value: string) => {
        const numValue = value === "" ? undefined : parseFloat(value);
        discountValueField.handleChange(numValue);
    }, [discountValueField]);

    /**
     * Handle min order value change
     */
    const handleMinOrderValueChange = useCallback((value: string) => {
        const numValue = value === "" ? undefined : parseFloat(value);
        minOrderValueField.handleChange(numValue);
    }, [minOrderValueField]);

    /**
     * Handle max discount amount change
     */
    const handleMaxDiscountAmountChange = useCallback((value: string) => {
        const numValue = value === "" ? undefined : parseFloat(value);
        maxDiscountAmountField.handleChange(numValue);
    }, [maxDiscountAmountField]);

    /**
     * Get label for discount value field
     */
    const getDiscountValueLabel = useCallback(() => {
        return (
            getDiscountProperty(discountTypeField.value as DiscountType, "label") ||
            "Discount Value"
        );
    }, [discountTypeField.value]);

    /**
     * Get currency symbol with loading state
     */
    const getCurrency = useCallback(() => {
        if (isLoading && !currencyCode) return "•";
        return currencySymbol;
    }, [isLoading, currencyCode, currencySymbol]);

    /**
     * Get suffix for discount value field
     */
    const getSuffix = useCallback(() => {
        return discountTypeField.value === "PERCENTAGE" ? "%" : getCurrency();
    }, [discountTypeField.value, getCurrency]);

    // Visibility flags
    const showDiscountValue = ["PERCENTAGE", "FIXED_AMOUNT", "CUSTOM_PRICE"].includes(
        discountTypeField.value || ""
    );

    const showMaxDiscountAmount =
        discountTypeField.value !== "CUSTOM_PRICE" &&
        discountTypeField.value !== "NO_DISCOUNT" &&
        discountTypeField.value !== undefined;

    return {
        // Field values
        discountType: discountTypeField.value,
        discountValue: discountValueField.value,
        minOrderValue: minOrderValueField.value,
        maxDiscountAmount: maxDiscountAmountField.value,

        // Options
        availableDiscountTypes,

        // Handlers
        handleDiscountTypeChange,
        handleDiscountValueChange,
        handleMinOrderValueChange,
        handleMaxDiscountAmountChange,

        // Helpers
        getDiscountValueLabel,
        getCurrency,
        getSuffix,
        getFieldError,

        // Visibility
        showDiscountValue,
        showMaxDiscountAmount,
    };
}