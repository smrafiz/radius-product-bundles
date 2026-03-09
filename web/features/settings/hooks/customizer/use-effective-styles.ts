"use client";

import { CustomizerStyles, useCustomizerStore } from "@/features/settings";
import { useMemo } from "react";

/**
 * Hook to resolve effective styles considering active device overrides.
 * Used by preview components to ensure the visual widget reflects
 * what the user is currently editing.
 */
export function useEffectiveStyles() {
    const { styles, activeDevice, activeBundleType } = useCustomizerStore();

    return useMemo(() => {
        let effective = { ...styles };

        if (
            activeBundleType &&
            styles.bundleTypeOverrides?.[activeBundleType]
        ) {
            effective = {
                ...effective,
                ...styles.bundleTypeOverrides[activeBundleType],
            };
        }

        if (activeDevice !== "desktop") {
            effective = { ...effective, ...(styles[activeDevice] || {}) };
        }

        return effective;
    }, [styles, activeDevice, activeBundleType]);
}
