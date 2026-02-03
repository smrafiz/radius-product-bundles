"use client";

import { useCallback, useState } from "react";
import { useFormContext } from "react-hook-form";
import { DEFAULT_CUSTOMIZER_STYLES } from "@/features/settings/constants/defaults.constants";
import { CustomizerPanelConfig, CustomizerStyles, useCustomizerStore } from "@/features/settings";

/**
 * Hook for managing the customizer panel actions.
 */
export function useCustomizerPanel(
    config: CustomizerPanelConfig,
    onFieldChange?: () => void,
    onClearErrors?: () => void,
) {
    const { resetToDefaults } = useCustomizerStore();
    const { setValue: setFormValue } = useFormContext<CustomizerStyles>();
    const defaultOpenSection = config.sections.find(s => s.defaultOpen)?.id ?? null;
    const [openSectionId, setOpenSectionId] = useState<string | null>(defaultOpenSection);

    /**
     * Restores all styles to defaults and triggers SaveBar.
     */
    const handleRestoreDefaults = useCallback(() => {
        resetToDefaults();

        // Sync default values to React Hook Form so they persist on save
        Object.entries(DEFAULT_CUSTOMIZER_STYLES).forEach(([field, value]) => {
            setFormValue(
                field as keyof CustomizerStyles,
                value as any,
                { shouldDirty: true },
            );
        });

        onClearErrors?.(); // Clear validation errors
        onFieldChange?.(); // Trigger save bar

        window.shopify?.toast?.show(
            "Customizer settings restored to defaults",
            {
                duration: 3000,
            },
        );
    }, [resetToDefaults, setFormValue, onFieldChange, onClearErrors]);

    /**
     * Toggles accordion section - closes first, then opens new.
     */
    const handleToggle = useCallback((sectionId: string) => {
        if (openSectionId === sectionId) {
            setOpenSectionId(null);
        } else if (openSectionId) {
            setOpenSectionId(null);
            setTimeout(() => setOpenSectionId(sectionId), 300);
        } else {
            setOpenSectionId(sectionId);
        }
    }, [openSectionId]);

    return {
        openSectionId,
        handleToggle,
        handleRestoreDefaults,
    };
}
