"use client";

import { PreviewProduct } from "@/shared";
import {
    WidgetCarousel,
    WidgetCompact,
    WidgetGrid,
    WidgetList,
} from "@/shared/components/bundle-widget";
import { useEffectiveStyles } from "@/features/settings";
import { useSettingsStore } from "@/features/settings/stores/settings.store";
import type { BundleTemplateProps } from "@/features/settings/types/template.types";
import {
    DEFAULT_DISPLAY_OPTIONS,
    PLACEHOLDER_PRODUCTS,
    PREVIEW_LABELS,
} from "@/shared/constants/bundle-widget.constants";
import { useTranslations } from "@/lib/i18n/provider";

export function TemplateFixed({ activeLayout }: BundleTemplateProps) {
    const styles = useEffectiveStyles();
    const tc = useTranslations("Settings.Customizer");
    const serverData = useSettingsStore((s) => s.serverData);
    const savedLabels = serverData?.labels as
        | Record<string, string>
        | undefined;
    const labels = {
        ...PREVIEW_LABELS,
        ...Object.fromEntries(
            Object.entries(savedLabels ?? {}).filter(([, val]) => val !== ""),
        ),
    };

    const translatedTitle = tc("bundleProduct");
    const translatedProducts = PLACEHOLDER_PRODUCTS.map((p) => ({
        ...p,
        title: translatedTitle,
    }));

    let products: PreviewProduct[];

    switch (activeLayout) {
        case "GRID":
        case "LIST":
            products = translatedProducts.slice(0, 3);
            break;

        case "COMPACT":
            products = translatedProducts.slice(0, 4);
            break;

        case "CAROUSEL":
        default:
            products = translatedProducts;
            break;
    }

    const layoutProps = {
        products,
        styles,
        displayOptions: DEFAULT_DISPLAY_OPTIONS,
        showEmptyState: false,
        labels,
    };

    switch (activeLayout) {
        case "GRID":
            return <WidgetGrid {...layoutProps} />;
        case "CAROUSEL":
            return <WidgetCarousel {...layoutProps} />;
        case "COMPACT":
            return <WidgetCompact {...layoutProps} />;
        case "LIST":
        default:
            return <WidgetList {...layoutProps} />;
    }
}
