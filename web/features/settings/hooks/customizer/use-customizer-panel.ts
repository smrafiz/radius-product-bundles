"use client";

import { useCallback, useState } from "react";
import { CustomizerPanelConfig, useCustomizerStore } from "@/features/settings";

/**
 * Hook for managing the customizer panel actions.
 */
export function useCustomizerPanel(
    config: CustomizerPanelConfig,
    onFieldChange?: () => void,
) {
    const { resetToDefaults } = useCustomizerStore();
    const defaultOpenSection = config.sections.find(s => s.defaultOpen)?.id ?? null;
    const [openSectionId, setOpenSectionId] = useState<string | null>(defaultOpenSection);

    /**
     * Restores all styles to defaults and triggers SaveBar.
     */
    const handleRestoreDefaults = useCallback(() => {
        resetToDefaults();
        onFieldChange?.();
    }, [resetToDefaults, onFieldChange]);

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
