"use client";

import { PreviewProduct } from "@/shared";
import { DEFAULT_DISPLAY_OPTIONS } from "@/shared/constants/bundle-widget.constants";
import type { WidgetPricing } from "@/shared";
import {
    WidgetClassicCard,
    WidgetSleek,
    WidgetMinimalist,
    WidgetCompactGrid,
    WidgetChecklist,
} from "@/shared/components/bundle-widget";
import {
    BundleTemplateProps,
    useEffectiveStyles,
    useSettingsStore,
} from "@/features/settings";
import { DEFAULT_LABELS } from "@/features/settings/constants/defaults.constants";
import { PLACEHOLDER_IMAGES } from "@/features/settings/constants/customizer.constants";

const BOGO_PRODUCTS: PreviewProduct[] = [
    {
        id: "trigger-1",
        title: "Trigger Product",
        image: PLACEHOLDER_IMAGES[1],
        price: "$300",
        quantity: 1,
        role: "TRIGGER",
    },
    {
        id: "reward-1",
        title: "Reward Product",
        image: PLACEHOLDER_IMAGES[2],
        price: "$0.00",
        compareAtPrice: "$300",
        quantity: 1,
        role: "REWARD",
    },
];

const BOGO_PRICING: WidgetPricing = {
    originalPrice: "$600.00",
    finalPrice: "$300.00",
    savingsAmount: "$300.00",
    savingsPercentage: 50,
    hasDiscount: true,
};

export function TemplateBogo({ activeLayout }: BundleTemplateProps) {
    const styles = useEffectiveStyles();
    const serverData = useSettingsStore((s) => s.serverData);
    const labels = {
        ...DEFAULT_LABELS,
        ...(serverData?.labels as Partial<typeof DEFAULT_LABELS>),
    };

    const layoutProps = {
        products: BOGO_PRODUCTS,
        styles,
        displayOptions: DEFAULT_DISPLAY_OPTIONS,
        showEmptyState: false,
        pricing: BOGO_PRICING,
        cartButtonText: "Claim This Offer",
        title: "Buy One Get One Free",
        subtitle: "Limited time promotional offer",
        badgeText: "BOGO OFFER",
        labels,
    };

    switch (activeLayout) {
        case "SLEEK":
            return <WidgetSleek {...layoutProps} />;
        case "COMPACT_GRID":
            return <WidgetCompactGrid {...layoutProps} />;
        case "MINIMALIST":
            return <WidgetMinimalist {...layoutProps} />;
        case "CHECKLIST":
            return <WidgetChecklist {...layoutProps} />;
        case "CLASSIC_CARD":
        default:
            return <WidgetClassicCard {...layoutProps} />;
    }
}
