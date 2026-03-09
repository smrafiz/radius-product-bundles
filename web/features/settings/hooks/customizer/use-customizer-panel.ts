"use client";

import { useCallback, useState } from "react";
import { useFormContext } from "react-hook-form";
import { DEFAULT_CUSTOMIZER_STYLES } from "@/features/settings/constants/defaults.constants";
import {
    CustomizerPanelConfig,
    CustomizerStyles,
    useCustomizerStore,
} from "@/features/settings";

/**
 * Hook for managing the customizer panel actions.
 */
export function useCustomizerPanel(
    config: CustomizerPanelConfig,
    onFieldChange?: () => void,
    onClearErrors?: () => void,
) {
    const { resetToDefaults } = useCustomizerStore();
    const { reset: resetForm } = useFormContext<CustomizerStyles>();
    const defaultOpenSection =
        config.sections.find((s) => s.defaultOpen)?.id ?? null;
    const [openSectionId, setOpenSectionId] = useState<string | null>(
        defaultOpenSection,
    );

    /**
     * Restores all styles to defaults and triggers SaveBar.
     */
    const handleRestoreDefaults = useCallback(() => {
        resetToDefaults();

        // Reset form values to defaults but keep defaultValues (server snapshot)
        // so RHF detects the diff and marks the form dirty
        resetForm(structuredClone(DEFAULT_CUSTOMIZER_STYLES), {
            keepDefaultValues: true,
        });

        onClearErrors?.(); // Clear validation errors
        onFieldChange?.(); // Trigger save bar

        window.shopify?.toast?.show(
            "Customizer settings restored to defaults",
            {
                duration: 3000,
            },
        );
    }, [resetToDefaults, resetForm, onFieldChange, onClearErrors]);

    /**
     * Toggles accordion section - closes first, then opens new.
     */
    const handleToggle = useCallback(
        (sectionId: string) => {
            if (openSectionId === sectionId) {
                setOpenSectionId(null);
            } else if (openSectionId) {
                setOpenSectionId(null);
                setTimeout(() => setOpenSectionId(sectionId), 300);
            } else {
                setOpenSectionId(sectionId);
            }
        },
        [openSectionId],
    );

    return {
        openSectionId,
        setOpenSectionId,
        handleToggle,
        handleRestoreDefaults,
    };
}
