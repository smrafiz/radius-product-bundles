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
    const {
        styles,
        activeDevice,
        activeBundleType,
        updateStyle,
        clearDeviceOverride,
        clearBundleTypeOverride,
    } = useCustomizerStore();

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

    const isTypeOverridden =
        !!activeBundleType &&
        styles.bundleTypeOverrides?.[activeBundleType]?.[fieldName] !== undefined;

    // Determine effective path for RHF
    let rhfPath: Path<CustomizerStyles>;
    if (activeDevice !== "desktop") {
        rhfPath = `${activeDevice}.${fieldName}` as Path<CustomizerStyles>;
    } else if (activeBundleType) {
        rhfPath = `bundleTypeOverrides.${activeBundleType}.${fieldName}` as Path<CustomizerStyles>;
    } else {
        rhfPath = fieldName as Path<CustomizerStyles>;
    }

    // Get error from the specific path
    const error = (
        activeDevice === "desktop"
            ? errors[fieldName]
            : (errors as any)[activeDevice]?.[fieldName]
    )?.message as string | undefined;

    // Resolve value: base -> type override -> device override
    let resolvedValue: any = styles[fieldName];

    if (activeBundleType) {
        const typeOverride = styles.bundleTypeOverrides?.[activeBundleType]?.[fieldName];
        if (typeOverride !== undefined) {
            resolvedValue = typeOverride;
        }
    }

    if (activeDevice !== "desktop") {
        const deviceOverride = styles[activeDevice]?.[fieldName];
        if (deviceOverride !== undefined) {
            resolvedValue = deviceOverride;
        }
    }

    const configDefault = (
        "defaultValue" in config ? config.defaultValue : undefined
    ) as CustomizerStyles[K] | undefined;

    const globalDefault = DEFAULT_CUSTOMIZER_STYLES[fieldName];

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

    const clearTypeOverride = useCallback(() => {
        if (!activeBundleType) return;
        clearBundleTypeOverride(fieldName);
        setValue(rhfPath, undefined as any, {
            shouldDirty: true,
        });
        onFieldChange?.();
    }, [
        activeBundleType,
        fieldName,
        rhfPath,
        setValue,
        clearBundleTypeOverride,
        onFieldChange,
    ]);

    return {
        value,
        error,
        handleChange,
        isInherited,
        isResponsive,
        isTypeOverridden,
        clearOverride,
        clearTypeOverride,
        activeDevice,
        activeBundleType,
    };
}
