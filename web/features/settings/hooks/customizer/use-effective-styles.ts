"use client";

import { useMemo } from "react";
import { useCustomizerStore } from "@/features/settings";
import { BundleType } from "@/features/bundles";
import { RESPONSIVE_FIELDS } from "@/features/settings/configs/customizer.config";

export function useEffectiveStyles() {
    const { styles, activeDevice, activeBundleType } = useCustomizerStore();

    return useMemo(() => {
        let effective = { ...styles };

        if (
            activeBundleType &&
            activeBundleType !== "CART_BANNER" &&
            styles.bundleTypeOverrides?.[activeBundleType as BundleType]
        ) {
            effective = {
                ...effective,
                ...styles.bundleTypeOverrides[activeBundleType as BundleType],
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
