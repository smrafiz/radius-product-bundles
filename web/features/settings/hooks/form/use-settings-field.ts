"use client";

import { useCallback } from "react";
import { useController } from "react-hook-form";
import { AppSettingsFormData } from "@/features/settings";

/**
 * Hook for managing individual settings fields.
 */
export function useSettingsField<T = any>({
    name,
    defaultValue,
}: {
    name: keyof AppSettingsFormData;
    defaultValue?: any;
}) {
    const {
        field,
        fieldState: { error, isDirty, isTouched },
    } = useController<AppSettingsFormData>({
        name,
        defaultValue,
    });

    /**
     * Handles field value change
     */
    const handleChange = useCallback(
        (value: T) => {
            field.onChange(value);
        },
        [field],
    );

    /**
     * Handles input element change event
     */
    const handleInputChange = useCallback(
        (
            event: React.ChangeEvent<
                HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
            >,
        ) => {
            const { type, value } = event.target;

            // Handle checkbox
            if (type === "checkbox") {
                field.onChange((event.target as HTMLInputElement).checked);
                return;
            }

            // Handle number
            if (type === "number") {
                field.onChange(value === "" ? undefined : Number(value));
                return;
            }

            // Handle text
            field.onChange(value);
        },
        [field],
    );

    /**
     * Handles Shopify component change event
     */
    const handleShopifyChange = useCallback(
        (event: CustomEvent | any) => {
            const target = event.target as HTMLInputElement;

            // Handle checkbox/switch
            if (target.type === "checkbox") {
                field.onChange(target.checked);
                return;
            }

            // Handle select
            if (target.tagName?.toLowerCase() === "s-select") {
                field.onChange(target.value);
                return;
            }

            // Handle number field
            if (target.tagName?.toLowerCase() === "s-number-field") {
                field.onChange(
                    target.value === "" ? undefined : Number(target.value),
                );
                return;
            }

            // Handle text field / text area
            field.onChange(target.value);
        },
        [field],
    );

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

        // Raw field for custom usage
        field,
    };
}
