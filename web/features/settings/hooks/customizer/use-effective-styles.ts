"use client";

import { useMemo } from "react";
import { useCustomizerStore } from "@/features/settings";
import { RESPONSIVE_FIELDS } from "@/features/settings/configs/customizer.config";

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
            const deviceMap = styles[activeDevice];
            if (deviceMap) {
                const filtered = Object.fromEntries(
                    Object.entries(deviceMap).filter(([k]) =>
                        RESPONSIVE_FIELDS.has(k),
                    ),
                );
                effective = { ...effective, ...filtered };
            }
        }

        return effective;
    }, [styles, activeDevice, activeBundleType]);
}
