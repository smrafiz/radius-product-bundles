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
    // Subscribe to the store
    const { styles, activeDevice, updateStyle } = useCustomizerStore();

    const {
        setValue,
        formState: { errors },
    } = useFormContext<CustomizerStyles>();

    const fieldName: K = config.name;

    // Determine effective path for RHF and validation
    // e.g. "primaryColor" or "mobile.primaryColor"
    const rhfPath =
        activeDevice === "desktop"
            ? fieldName
            : (`${activeDevice}.${fieldName}` as Path<CustomizerStyles>);

    // Get error from the specific path
    // We need to cast because RHF types get complex with dynamic paths
    const error = (
        activeDevice === "desktop"
            ? errors[fieldName]
            : (errors as any)[activeDevice]?.[fieldName]
    )?.message as string | undefined;

    // Resolve value: Override -> Store Base -> Config Default -> Global Default
    let resolvedValue: any = styles[fieldName];

    if (activeDevice !== "desktop") {
        const override = styles[activeDevice]?.[fieldName];
        if (override !== undefined) {
            resolvedValue = override;
        }
    }

    const configDefault = (
        "defaultValue" in config ? config.defaultValue : undefined
    ) as CustomizerStyles[K] | undefined;

    const globalDefault = DEFAULT_CUSTOMIZER_STYLES[fieldName];

    // Final effective value
    const value = resolvedValue ?? configDefault ?? globalDefault;

    /**
     * Updates both RHF (validation) and Zustand (preview).
     */
    const handleChange = useCallback(
        (newValue: CustomizerStyles[K]) => {
            // Update RHF for validation/submission
            setValue(rhfPath, newValue as any, {
                shouldDirty: true,
                shouldValidate: true,
            });

            // Update Zustand for live preview
            // Note: updateStyle handles the activeDevice redirect internally
            updateStyle(fieldName, newValue);

            // Trigger SaveBar dirty state
            onFieldChange?.();
        },
        [fieldName, rhfPath, setValue, updateStyle, onFieldChange],
    );

    return {
        value,
        error,
        handleChange,
    };
}
