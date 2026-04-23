"use client";

import { useCallback } from "react";
import { triggerSaveBar } from "@/shared";
import { useFormContext, useWatch } from "react-hook-form";
import { useBundleFormMethods, useBundleStore } from "@/features/bundles";

/**
 * Hook for managing individual bundle form fields with validation.
 * Uses useWatch for field-scoped re-renders — only re-renders when
 * this specific field changes, not on any form field change.
 */
export function useBundleField<T = string>(fieldName: string) {
    const { setValue } = useBundleFormMethods();
    const markDirty = useBundleStore((s) => s.markDirty);
    const markFieldTouched = useBundleStore((s) => s.markFieldTouched);
    const { clearErrors, trigger, control } = useFormContext();

    const value = useWatch({ control, name: fieldName as any }) as T;

    /**
     * Handle field change with immediate error clearing.
     */
    const handleChange = useCallback(
        (newValue: T, shouldClearError = true) => {
            // Clear error immediately if user is fixing the input
            if (shouldClearError && newValue) {
                clearErrors(fieldName);
            }

            setValue(fieldName as any, newValue, {
                shouldValidate: true,
                shouldDirty: true,
            });

            markDirty();
            triggerSaveBar();
        },
        [fieldName, setValue, markDirty, clearErrors],
    );

    /**
     * Handle field blur — marks field as touched and triggers validation.
     */
    const handleBlur = useCallback(() => {
        markFieldTouched(fieldName);
        void trigger(fieldName);
    }, [fieldName, markFieldTouched, trigger]);

    /**
     * Clear errors for this field.
     */
    const clearFieldError = useCallback(() => {
        clearErrors(fieldName);
    }, [clearErrors, fieldName]);

    return {
        value,
        handleChange,
        handleBlur,
        clearFieldError,
    };
}
