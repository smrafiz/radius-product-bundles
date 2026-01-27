"use client";

import { useCallback } from "react";
import { useFormContext } from "react-hook-form";
import { CustomizerFieldConfig, CustomizerStyles, useCustomizerStore, } from "@/features/settings";

/**
 * Hook for managing a single customizer field.
 */
export function useCustomizerField(
    config: CustomizerFieldConfig,
    onFieldChange?: () => void,
) {
    const { styles, updateStyle } = useCustomizerStore();

    const {
        setValue,
        formState: { errors },
    } = useFormContext<CustomizerStyles>();

    const value = styles[config.name];
    const defaultValue = (config as any).defaultValue;
    const error = errors[config.name]?.message as string | undefined;

    /**
     * Updates both RHF (validation) and Zustand (preview).
     */
    const handleChange = useCallback(
        (newValue: CustomizerStyles[typeof config.name]) => {
            // Update RHF for validation
            setValue(config.name, newValue, {
                shouldDirty: true,
                shouldValidate: true,
            });

            // Update Zustand for live preview
            updateStyle(config.name, newValue);

            // Trigger SaveBar dirty state
            onFieldChange?.();
        },
        [config.name, setValue, updateStyle, onFieldChange],
    );

    /**
     * Gets the display value with fallback to default.
     */
    const displayValue = value ?? defaultValue;

    return {
        value: displayValue,
        error,
        handleChange,
    };
}
