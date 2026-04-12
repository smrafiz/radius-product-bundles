"use client";

import { useCallback } from "react";
import { triggerSaveBar } from "@/shared";
import { useFormContext } from "react-hook-form";
import { useBundleFormMethods, useBundleStore } from "@/features/bundles";

/**
 * Hook for managing individual bundle form fields with validation.
 */
export function useBundleField<T = string>(fieldName: string) {
    const { watch, setValue } = useBundleFormMethods();
    const markDirty = useBundleStore((s) => s.markDirty);
    const markFieldTouched = useBundleStore((s) => s.markFieldTouched);
    const { clearErrors, trigger } = useFormContext();

    const value = watch(fieldName as any) as T;

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
