"use client";

import { PreviewProduct } from "@/shared";
import {
    DEFAULT_DISPLAY_OPTIONS,
    PLACEHOLDER_PRICING,
} from "@/shared/constants/bundle-widget.constants";
import { WidgetClassicCard } from "@/shared/components/bundle-widget";
import { BundleTemplateProps, useEffectiveStyles } from "@/features/settings";
import { PLACEHOLDER_IMAGES } from "@/features/settings/constants/customizer.constants";

const BOGO_PRODUCTS: PreviewProduct[] = [
    {
        id: "trigger-1",
        title: "Trigger Product A",
        image: PLACEHOLDER_IMAGES[1],
        price: "$300.33",
        compareAtPrice: "$600.00",
        quantity: 1,
        role: "TRIGGER",
    },
    {
        id: "reward-1",
        title: "Reward Product",
        image: PLACEHOLDER_IMAGES[2],
        price: "$0.00",
        compareAtPrice: "$600.00",
        quantity: 1,
        role: "REWARD",
    },
];

export function TemplateBogo({ activeLayout }: BundleTemplateProps) {
    const styles = useEffectiveStyles();

    const layoutProps = {
        products: BOGO_PRODUCTS,
        styles,
        displayOptions: DEFAULT_DISPLAY_OPTIONS,
        showEmptyState: false,
        pricing: PLACEHOLDER_PRICING,
        cartButtonText: "Add bundle to cart",
    };

    switch (activeLayout) {
        case "CLASSIC_CARD":
        case "COMPACT_GRID":
        case "MINIMALIST":
        default:
            return <WidgetClassicCard {...layoutProps} />;
    }
}
