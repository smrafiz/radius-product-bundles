"use client";

import {
    PreviewTemplateId,
    useCustomizerStore,
    useEffectiveStyles,
    type WidgetLayout,
} from "@/features/settings";
import { useMemo } from "react";
import type { BundleType } from "@/features/bundles";
import { TEMPLATE_REGISTRY } from "@/features/settings/constants/template.constants";
import { CUSTOMIZER_LAYOUTS_MAPPING } from "@/features/settings/constants/customizer.constants";
import { useTranslations } from "@/lib/i18n/provider";
import { usePlan } from "@/shared";

export function usePreviewShell(bundleType: PreviewTemplateId) {
    const { activeLayout, activeDevice, setActiveLayout } =
        useCustomizerStore();
    const styles = useEffectiveStyles();
    const { plan } = usePlan();

    const allLayouts = CUSTOMIZER_LAYOUTS_MAPPING[bundleType];
    const allowedLayoutValues =
        plan.limits.allowedLayouts[bundleType as BundleType];
    const layouts = allowedLayoutValues
        ? allLayouts.filter((l) => allowedLayoutValues.includes(l.value))
        : allLayouts;

    const Template = TEMPLATE_REGISTRY[bundleType];

    const t = useTranslations("Settings.Customizer");
    const tt = useTranslations("Bundles.Types");

    const heading =
        bundleType === "CART_BANNER"
            ? t("preview.cartBannerLayout")
            : t("preview.bundleLayout", {
                  label: tt(`${bundleType as BundleType}.label`),
              });

    const isCartBanner = bundleType === "CART_BANNER";

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
        isCartBanner,
        setActiveLayout,
    };
}
