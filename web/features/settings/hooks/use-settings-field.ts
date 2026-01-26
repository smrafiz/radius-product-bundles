"use client";

import { useCallback } from "react";
import { triggerSaveBar } from "@/shared";
import { useController, useFormContext } from "react-hook-form";
import { AppSettingsFormData, useSettingsStore } from "@/features/settings";

/** Form ID for settings - used with GlobalForm */
const SETTINGS_FORM_ID = "settings";

/**
 * Hook for managing individual settings fields.
 *
 * Automatically triggers the SaveBar when field values change,
 * following the same pattern as useBundleField.
 */
export function useSettingsField<T = any>({
    name,
    defaultValue,
}: {
    name: keyof AppSettingsFormData;
    defaultValue?: any;
}) {
    const { clearErrors } = useFormContext<AppSettingsFormData>();
    const { markDirty } = useSettingsStore();

    const {
        field,
        fieldState: { error, isDirty, isTouched },
    } = useController<AppSettingsFormData>({
        name,
        defaultValue,
    });

    /**
     * Handles field value change with SaveBar trigger.
     */
    const handleChange = useCallback(
        (value: T, shouldClearError = true) => {
            // Clear error immediately if user is fixing the input
            if (shouldClearError && value !== undefined && value !== null) {
                clearErrors(name);
            }

            field.onChange(value);
            markDirty();
            triggerSaveBar(SETTINGS_FORM_ID);
        },
        [field, name, markDirty, clearErrors],
    );

    /**
     * Handles input element change event with SaveBar trigger.
     */
    const handleInputChange = useCallback(
        (
            event: React.ChangeEvent<
                HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
            >,
        ) => {
            const { type, value } = event.target;

            // Clear error on input
            clearErrors(name);

            // Handle checkbox
            if (type === "checkbox") {
                field.onChange((event.target as HTMLInputElement).checked);
                markDirty();
                triggerSaveBar(SETTINGS_FORM_ID);
                return;
            }

            // Handle number
            if (type === "number") {
                field.onChange(value === "" ? undefined : Number(value));
                markDirty();
                triggerSaveBar(SETTINGS_FORM_ID);
                return;
            }

            // Handle text
            field.onChange(value);
            markDirty();
            triggerSaveBar(SETTINGS_FORM_ID);
        },
        [field, name, markDirty, clearErrors],
    );

    /**
     * Handles Shopify component change event with SaveBar trigger.
     */
    const handleShopifyChange = useCallback(
        (event: CustomEvent | any) => {
            const target = event.target as HTMLInputElement;

            // Clear error on input
            clearErrors(name);

            // Handle checkbox/switch
            if (target.type === "checkbox") {
                field.onChange(target.checked);
                markDirty();
                triggerSaveBar(SETTINGS_FORM_ID);
                return;
            }

            // Handle select
            if (target.tagName?.toLowerCase() === "s-select") {
                field.onChange(target.value);
                markDirty();
                triggerSaveBar(SETTINGS_FORM_ID);
                return;
            }

            // Handle number field
            if (target.tagName?.toLowerCase() === "s-number-field") {
                field.onChange(
                    target.value === "" ? undefined : Number(target.value),
                );
                markDirty();
                triggerSaveBar(SETTINGS_FORM_ID);
                return;
            }

            // Handle text field / text area
            field.onChange(target.value);
            markDirty();
            triggerSaveBar(SETTINGS_FORM_ID);
        },
        [field, name, markDirty, clearErrors],
    );

    /**
     * Clears errors for this field.
     */
    const clearFieldError = useCallback(() => {
        clearErrors(name);
    }, [clearErrors, name]);

    return {
        // Field props for native inputs
        value: field.value as T,
        name: field.name,
        ref: field.ref,
        onBlur: field.onBlur,

        // Change handlers
        onChange: handleChange,
        onInputChange: handleInputChange,
        onShopifyChange: handleShopifyChange,

        // Field state
        error: error?.message,
        hasError: !!error,
        isDirty,
        isTouched,

        // Utilities
        clearFieldError,

        // Raw field for custom usage
        field,
    };
}
