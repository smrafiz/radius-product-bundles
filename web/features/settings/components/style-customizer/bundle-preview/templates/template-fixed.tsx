"use client";

import { PreviewProduct } from "@/shared";
import {
    WidgetCarousel,
    WidgetCompact,
    WidgetGrid,
    WidgetList,
} from "@/shared/components/bundle-widget";
import { useEffectiveStyles } from "@/features/settings";
import type { BundleTemplateProps } from "@/features/settings/types/template.types";
import {
    DEFAULT_DISPLAY_OPTIONS,
    PLACEHOLDER_PRODUCTS,
} from "@/shared/constants/bundle-widget.constants";

export function TemplateFixed({ activeLayout }: BundleTemplateProps) {
    const styles = useEffectiveStyles();

    let products: PreviewProduct[];

    switch (activeLayout) {
        case "GRID":
        case "LIST":
            products = PLACEHOLDER_PRODUCTS.slice(0, 3);
            break;

        case "COMPACT":
            products = PLACEHOLDER_PRODUCTS.slice(0, 4);
            break;

        case "CAROUSEL":
        default:
            products = PLACEHOLDER_PRODUCTS;
            break;
    }

    const layoutProps = {
        products,
        styles,
        displayOptions: DEFAULT_DISPLAY_OPTIONS,
        showEmptyState: false,
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
