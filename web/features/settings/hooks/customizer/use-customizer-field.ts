"use client";

import { useCallback } from "react";
import { Path, PathValue, useFormContext } from "react-hook-form";
import { CustomizerFieldConfig, CustomizerStyles, useCustomizerStore } from "@/features/settings";
import { DEFAULT_CUSTOMIZER_STYLES } from "@/features/settings/constants";

/**
 * Hook for managing a single customizer field.
 *
 * Uses generic type parameter to preserve the field name literal type.
 */
export function useCustomizerField<K extends keyof CustomizerStyles>(
    config: CustomizerFieldConfig & { name: K },
    onFieldChange?: () => void,
) {
    const { styles, updateStyle } = useCustomizerStore();

    const {
        setValue,
        formState: { errors },
    } = useFormContext<CustomizerStyles>();

    const fieldName: K = config.name;
    const value: CustomizerStyles[K] = styles[fieldName];
    const error = errors[fieldName]?.message as string | undefined;

    const defaultValue = (
        "defaultValue" in config ? config.defaultValue : undefined
    ) as CustomizerStyles[K] | undefined;

    /**
     * Updates both RHF (validation) and Zustand (preview).
     */
    const handleChange = useCallback(
        (newValue: CustomizerStyles[K]) => {
            setValue(
                fieldName as Path<CustomizerStyles>,
                newValue as PathValue<CustomizerStyles, Path<CustomizerStyles>>,
                { shouldDirty: true, shouldValidate: true },
            );

            // Update Zustand for live preview
            updateStyle(fieldName, newValue);

            // Trigger SaveBar dirty state
            onFieldChange?.();
        },
        [fieldName, setValue, updateStyle, onFieldChange],
    );

    // Display value with fallback chain: store → config → defaults
    const displayValue = value ?? defaultValue ?? DEFAULT_CUSTOMIZER_STYLES[fieldName];

    return {
        value: displayValue,
        error,
        handleChange,
    };
}
