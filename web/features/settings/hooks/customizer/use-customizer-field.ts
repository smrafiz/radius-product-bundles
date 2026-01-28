"use client";

import { useCallback } from "react";
import { Path, PathValue, useFormContext } from "react-hook-form";
import {
    CustomizerFieldConfig,
    CustomizerStyles,
    useCustomizerStore,
} from "@/features/settings";
import { DEFAULT_CUSTOMIZER_STYLES } from "@/features/settings/constants";

/**
 * Hook for managing a single customizer field.
 *
 * Reads value from Zustand store for live preview updates.
 */
export function useCustomizerField<K extends keyof CustomizerStyles>(
    config: CustomizerFieldConfig & { name: K },
    onFieldChange?: () => void,
) {
    // Subscribe to the specific field value from the store
    const storeValue = useCustomizerStore((state) => state.styles[config.name]);
    const updateStyle = useCustomizerStore((state) => state.updateStyle);

    const {
        setValue,
        formState: { errors },
    } = useFormContext<CustomizerStyles>();

    const fieldName: K = config.name;
    const error = errors[fieldName]?.message as string | undefined;

    // Get default from config or global defaults
    const configDefault = (
        "defaultValue" in config ? config.defaultValue : undefined
    ) as CustomizerStyles[K] | undefined;

    const globalDefault = DEFAULT_CUSTOMIZER_STYLES[fieldName];

    // Value with fallback chain: store → config default → global default
    const value = storeValue ?? configDefault ?? globalDefault;

    /**
     * Updates both RHF (validation) and Zustand (preview).
     */
    const handleChange = useCallback(
        (newValue: CustomizerStyles[K]) => {
            // Update RHF for validation
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

    return {
        value,
        error,
        handleChange,
    };
}
