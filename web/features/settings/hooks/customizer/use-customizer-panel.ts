"use client";

import { useCallback } from "react";
import { useCustomizerStore } from "@/features/settings";

/**
 * Hook for managing the customizer panel actions.
 */
export function useCustomizerPanel(onFieldChange?: () => void) {
    const { resetToDefaults } = useCustomizerStore();

    /**
     * Restores all styles to defaults and triggers SaveBar.
     */
    const handleRestoreDefaults = useCallback(() => {
        resetToDefaults();
        onFieldChange?.();
    }, [resetToDefaults, onFieldChange]);

    return {
        handleRestoreDefaults,
    };
}
