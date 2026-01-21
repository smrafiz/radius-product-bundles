"use client";

import { useCallback } from "react";
import { useFormContext } from "react-hook-form";
import { AppSettingsFormData } from "@/features/settings";

/**
 * Hook for accessing settings form methods.
 */
export function useSettingsForm() {
    const form = useFormContext<AppSettingsFormData>();

    if (!form) {
        throw new Error(
            "useSettingsForm must be used within SettingsFormProvider",
        );
    }

    const {
        setValue: originalSetValue,
        formState,
        getValues,
        watch,
        trigger,
        reset,
        handleSubmit,
        ...restForm
    } = form;

    /**
     * Wrapped setValue that always marks the form as dirty
     */
    const setValue = useCallback(
        <K extends keyof AppSettingsFormData>(
            name: K,
            value: AppSettingsFormData[K],
            options?: { shouldValidate?: boolean; shouldDirty?: boolean },
        ) => {
            originalSetValue(name, value, {
                shouldDirty: true,
                ...options,
            });
        },
        [originalSetValue],
    );

    /**
     * Gets a specific field error message
     */
    const getFieldError = useCallback(
        (fieldName: keyof AppSettingsFormData): string | undefined => {
            return formState.errors[fieldName]?.message as string | undefined;
        },
        [formState.errors],
    );

    /**
     * Gets all current validation errors
     */
    const getAllErrors = useCallback(() => {
        return Object.entries(formState.errors).map(([field, error]) => ({
            field,
            message: error?.message || "Invalid value",
        }));
    }, [formState.errors]);

    /**
     * Checks if a specific field has been modified
     */
    const isFieldDirty = useCallback(
        (fieldName: keyof AppSettingsFormData): boolean => {
            return formState.dirtyFields[fieldName] === true;
        },
        [formState.dirtyFields],
    );

    /**
     * Resets form to initial or provided values
     */
    const resetForm = useCallback(
        (values?: Partial<AppSettingsFormData>) => {
            if (values) {
                reset(values as AppSettingsFormData);
            } else {
                reset();
            }
        },
        [reset],
    );

    return {
        ...restForm,
        formState,
        setValue,
        getValues,
        watch,
        trigger,
        reset: resetForm,
        handleSubmit,
        getFieldError,
        getAllErrors,
        isFieldDirty,
        // Convenience accessors
        errors: formState.errors,
        isDirty: formState.isDirty,
        isValid: formState.isValid,
        isSubmitting: formState.isSubmitting,
    };
}
