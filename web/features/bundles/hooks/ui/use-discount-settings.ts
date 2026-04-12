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
import { useShallow } from "zustand/react/shallow";
import { useCallback, useMemo } from "react";
import { useFormContext } from "react-hook-form";
import { getCurrencySymbol, triggerSaveBar, usePlan, useShopSettings } from "@/shared";

/**
 * Hook for managing discount settings state and actions.
 */
export function useDiscountSettings() {
    const { getFieldError } = useBundleValidation();
    const { markDirty, bundleData, setBundleData, markFieldTouched } =
        useBundleStore(
            useShallow((s) => ({
                markDirty: s.markDirty,
                bundleData: s.bundleData,
                setBundleData: s.setBundleData,
                markFieldTouched: s.markFieldTouched,
            })),
        );
    const { isLoading, currencyCode } = useShopSettings();
    const { plan } = usePlan();
    const { watch, setValue } = useBundleFormMethods();
    const { trigger } = useFormContext();

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

    const isDiscountTypeLocked = useCallback(
        (typeId: string) =>
            !plan.limits.allowedDiscountTypes.includes(typeId as DiscountType),
        [plan.limits.allowedDiscountTypes],
    );

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
        if (isLoading && !currencyCode) {
            return "•";
        }

        return currencySymbol;
    }, [isLoading, currencyCode, currencySymbol]);

    const isPercentage = discountType === "PERCENTAGE";

    /**
     * Get suffix for discount value field (percentage only).
     */
    const getSuffix = useCallback(() => {
        return isPercentage ? "%" : undefined;
    }, [isPercentage]);

    /**
     * Get prefix for discount value field (amount types only).
     */
    const getPrefix = useCallback(() => {
        return isPercentage ? undefined : getCurrency();
    }, [isPercentage, getCurrency]);

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

    /**
     * Create a blur handler for a specific field.
     */
    const createBlurHandler = useCallback(
        (fieldName: string) => () => {
            markFieldTouched(fieldName);
            void trigger(fieldName);
        },
        [markFieldTouched, trigger],
    );

    return {
        // Field values
        discountType,
        discountValue,
        minOrderValue,
        maxDiscountAmount,

        // Options
        availableDiscountTypes,
        isDiscountTypeLocked,

        // Handlers
        handleDiscountTypeChange,
        handleDiscountValueChange,
        handleMinOrderValueChange,
        handleMaxDiscountAmountChange,
        createBlurHandler,

        // Helpers
        getDiscountValueLabel,
        getCurrency,
        getSuffix,
        getPrefix,
        getFieldError,

        // Visibility
        showDiscountValue,
        showMaxDiscountAmount,
    };
}
