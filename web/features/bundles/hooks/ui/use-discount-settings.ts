"use client";

import {
    DISCOUNT_TYPES,
    DiscountType,
    getDiscountProperty,
    getDiscountTypesForBundle,
    useBundleFormMethods,
    useBundleStore,
    useBundleValidation,
} from "@/features/bundles";
import { useCallback, useEffect, useMemo, useRef } from "react";
import { getCurrencySymbol, triggerSaveBar, useShopSettings } from "@/shared";

/**
 * Hook for managing discount settings state and actions.
 */
export function useDiscountSettings() {
    const { getFieldError } = useBundleValidation();
    const { markDirty, bundleData, setBundleData } = useBundleStore();
    const { isLoading, currencyCode } = useShopSettings();
    const { watch, setValue } = useBundleFormMethods();
    const isInitialized = useRef(false);

    // Watch form fields directly
    const discountType = watch("discountType") as string | undefined;
    const discountValue = watch("discountValue") as number | undefined;
    const minOrderValue = watch("minOrderValue") as number | undefined;
    const maxDiscountAmount = watch("maxDiscountAmount") as number | undefined;

    // Derived values
    const currencySymbol = getCurrencySymbol(currencyCode);
    const bundleType = bundleData?.type;

    /**
     * Get filtered discount types based on bundle type.
     */
    const availableDiscountTypes = useMemo(() => {
        return bundleType
            ? getDiscountTypesForBundle(bundleType)
            : Object.values(DISCOUNT_TYPES);
    }, [bundleType]);

    /**
     * Set default discount type and value on mount (without triggering save bar).
     */
    useEffect(() => {
        if (isInitialized.current) return;
        isInitialized.current = true;

        // Set defaults silently - don't trigger save bar
        if (!discountType) {
            setValue("discountType", "PERCENTAGE", { shouldDirty: false });
            setBundleData({ discountType: "PERCENTAGE" });
        }

        if (discountValue === undefined || discountValue === 0) {
            setValue("discountValue", 10, { shouldDirty: false });
            setBundleData({ discountValue: 10 });
        }
    }, [discountType, discountValue, setValue, setBundleData]);

    /**
     * Handle discount type change.
     */
    const handleDiscountTypeChange = useCallback(
        (value: string) => {
            setValue("discountType", value as DiscountType, {
                shouldDirty: true,
            });
            setBundleData({ discountType: value as DiscountType });

            if (value === "CUSTOM_PRICE") {
                setValue("maxDiscountAmount", undefined, { shouldDirty: true });
                setBundleData({ maxDiscountAmount: undefined });
            }

            markDirty();
            triggerSaveBar();
        },
        [setValue, markDirty, setBundleData],
    );

    /**
     * Handle discount value change.
     */
    const handleDiscountValueChange = useCallback(
        (value: string) => {
            const numValue = value === "" ? undefined : parseFloat(value);
            setValue("discountValue", numValue, { shouldDirty: true });
            setBundleData({ discountValue: numValue });
            markDirty();
            triggerSaveBar();
        },
        [setValue, markDirty, setBundleData],
    );

    /**
     * Handle min order value change.
     */
    const handleMinOrderValueChange = useCallback(
        (value: string) => {
            const numValue = value === "" ? undefined : parseFloat(value);
            setValue("minOrderValue", numValue, { shouldDirty: true });
            setBundleData({ minOrderValue: numValue });
            markDirty();
            triggerSaveBar();
        },
        [setValue, markDirty, setBundleData],
    );

    /**
     * Handle max discount amount change.
     */
    const handleMaxDiscountAmountChange = useCallback(
        (value: string) => {
            const numValue = value === "" ? undefined : parseFloat(value);
            setValue("maxDiscountAmount", numValue, { shouldDirty: true });
            setBundleData({ maxDiscountAmount: numValue });
            markDirty();
            triggerSaveBar();
        },
        [setValue, markDirty, setBundleData],
    );

    /**
     * Get label for discount value field.
     */
    const getDiscountValueLabel = useCallback(() => {
        return (
            getDiscountProperty(discountType as DiscountType, "label") ||
            "Discount Value"
        );
    }, [discountType]);

    /**
     * Get currency symbol with loading state.
     */
    const getCurrency = useCallback(() => {
        if (isLoading && !currencyCode) return "•";
        return currencySymbol;
    }, [isLoading, currencyCode, currencySymbol]);

    /**
     * Get suffix for discount value field.
     */
    const getSuffix = useCallback(() => {
        return discountType === "PERCENTAGE" ? "%" : getCurrency();
    }, [discountType, getCurrency]);

    // Visibility flags
    const showDiscountValue = [
        "PERCENTAGE",
        "FIXED_AMOUNT",
        "CUSTOM_PRICE",
    ].includes(discountType || "");

    const showMaxDiscountAmount =
        discountType !== "CUSTOM_PRICE" &&
        discountType !== "NO_DISCOUNT" &&
        discountType !== undefined;

    return {
        // Field values
        discountType,
        discountValue,
        minOrderValue,
        maxDiscountAmount,

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
