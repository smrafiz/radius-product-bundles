"use client";

import { PreviewProduct } from "@/shared";
import {
    WidgetCarousel,
    WidgetCompact,
    WidgetGrid,
    WidgetList,
} from "@/shared/components/bundle-widget";
import { useEffectiveStyles, usePreviewProducts } from "@/features/settings";
import { useSettingsStore } from "@/features/settings/stores/settings.store";
import type { BundleTemplateProps } from "@/features/settings/types/template.types";
import {
    DEFAULT_DISPLAY_OPTIONS,
    PLACEHOLDER_PRODUCTS,
} from "@/shared/constants/bundle-widget.constants";
import { useTranslations } from "@/lib/i18n/provider";
import { usePreviewLabels } from "@/shared";

export function TemplateFixed({ activeLayout }: BundleTemplateProps) {
    const styles = useEffectiveStyles();
    const tc = useTranslations("Settings.Customizer");
    const previewLabels = usePreviewLabels();
    const serverData = useSettingsStore((s) => s.serverData);
    const savedLabels = serverData?.labels as
        | Record<string, string>
        | undefined;
    const labels = {
        ...previewLabels,
        ...Object.fromEntries(
            Object.entries(savedLabels ?? {}).filter(([, val]) => val !== ""),
        ),
    };

    const maxCount =
        activeLayout === "GRID" || activeLayout === "LIST"
            ? 3
            : activeLayout === "COMPACT"
              ? 4
              : undefined;

    const translatedPlaceholders = PLACEHOLDER_PRODUCTS.map((p) => ({
        ...p,
        title: tc("bundleProduct"),
    }));

    const products = usePreviewProducts({
        placeholderProducts: translatedPlaceholders,
        maxCount,
    });

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
