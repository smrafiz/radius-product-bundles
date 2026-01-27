"use client";

import { useCustomizerStore } from "@/features/settings";

/**
 * Hook for managing customizer state.
 */
export function useCustomizer() {
    const store = useCustomizerStore();

    return {
        // State
        styles: store.styles,
        isInitialized: store.isInitialized,
        activeLayout: store.activeLayout,

        // Actions
        updateStyle: store.updateStyle,
        updateStyles: store.updateStyles,
        setActiveLayout: store.setActiveLayout,
        resetToDefaults: store.resetToDefaults,
        discardChanges: store.discardChanges,
        initializeStyles: store.initializeStyles,
        initializeFromGlobalStyles: store.initializeFromGlobalStyles,
        getStyles: store.getStyles,
        getGlobalStyles: store.getGlobalStyles,
        markClean: store.markClean,
    };
}
