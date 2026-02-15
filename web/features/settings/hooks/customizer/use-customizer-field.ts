"use client";

import { useCallback } from "react";
import { Path, useFormContext } from "react-hook-form";
import { DEFAULT_CUSTOMIZER_STYLES } from "@/features/settings/constants/defaults.constants";
import {
    CustomizerFieldConfig,
    CustomizerStyles,
    useCustomizerStore,
} from "@/features/settings";

/**
 * Hook for managing a single customizer field.
 */
export function useCustomizerField<K extends keyof CustomizerStyles>(
    config: CustomizerFieldConfig & { name: K },
    onFieldChange?: () => void,
) {
    const { styles, activeDevice, updateStyle, clearDeviceOverride } =
        useCustomizerStore();

    const {
        setValue,
        formState: { errors },
    } = useFormContext<CustomizerStyles>();

    const fieldName: K = config.name;
    const isResponsive = "responsive" in config && config.responsive === true;
    const isInherited =
        activeDevice !== "desktop" &&
        isResponsive &&
        styles[activeDevice]?.[fieldName] === undefined;

    // Determine effective path for RHF and validation
    const rhfPath =
        activeDevice === "desktop"
            ? fieldName
            : (`${activeDevice}.${fieldName}` as Path<CustomizerStyles>);

    // Get error from the specific path
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

    const handleChange = useCallback(
        (newValue: CustomizerStyles[K]) => {
            setValue(rhfPath, newValue as any, {
                shouldDirty: true,
                shouldValidate: true,
            });
            updateStyle(fieldName, newValue);
            onFieldChange?.();
        },
        [fieldName, rhfPath, setValue, updateStyle, onFieldChange],
    );

    const clearOverride = useCallback(() => {
        if (activeDevice === "desktop" || !isResponsive) return;
        clearDeviceOverride(fieldName);
        setValue(rhfPath, undefined as any, {
            shouldDirty: true,
        });
        onFieldChange?.();
    }, [
        activeDevice,
        isResponsive,
        fieldName,
        rhfPath,
        setValue,
        clearDeviceOverride,
        onFieldChange,
    ]);

    return {
        value,
        error,
        handleChange,
        isInherited,
        isResponsive,
        clearOverride,
        activeDevice,
    };
}
