"use client";

import { CustomizerStyles, useCustomizerStore } from "@/features/settings";
import { useMemo } from "react";

/**
 * Hook to resolve effective styles considering active device overrides.
 * Used by preview components to ensure the visual widget reflects 
 * what the user is currently editing.
 */
export function useEffectiveStyles() {
    const { styles, activeDevice } = useCustomizerStore();

    return useMemo(() => {
        if (activeDevice === "desktop") {
            return styles;
        }

        const overrides = styles[activeDevice] || {};

        // Merge base styles with device-specific overrides
        return {
            ...styles,
            ...overrides,
        };
    }, [styles, activeDevice]);
}
