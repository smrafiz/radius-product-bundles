"use client";

import {
    useCustomizerStore,
    useEffectiveStyles,
} from "@/features/settings";
import { useMemo } from "react";
import type { BundleType } from "@/features/bundles";
import type { WidgetLayout } from "@/prisma/generated/enums";
import { BUNDLE_TYPES } from "@/features/bundles/constants/bundle-types.constants";
import { TEMPLATE_REGISTRY } from "@/features/settings/constants/template.constants";
import { CUSTOMIZER_LAYOUTS_MAPPING } from "@/features/settings/constants/customizer.constants";

export function usePreviewShell(bundleType: BundleType) {
    const { activeLayout, activeDevice, setActiveLayout } =
        useCustomizerStore();
    const styles = useEffectiveStyles();

    const layouts = CUSTOMIZER_LAYOUTS_MAPPING[bundleType];
    const Template = TEMPLATE_REGISTRY[bundleType];
    const heading = `${BUNDLE_TYPES[bundleType].label} Layout`;

    const validLayout = useMemo(() => {
        const layoutValues = layouts.map((l: { value: string }) => l.value);
        if (layoutValues.includes(activeLayout)) {
            return activeLayout;
        }
        return layouts[0].value as WidgetLayout;
    }, [activeLayout, layouts]);

    return {
        activeLayout: validLayout,
        activeDevice,
        styles,
        layouts,
        heading,
        Template,
        setActiveLayout,
    };
}
