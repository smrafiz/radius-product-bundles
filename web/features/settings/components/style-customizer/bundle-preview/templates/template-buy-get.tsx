"use client";

import { PreviewProduct } from "@/shared";
import {
    DEFAULT_DISPLAY_OPTIONS,
} from "@/shared/constants/bundle-widget.constants";
import type { WidgetPricing } from "@/shared";
import { WidgetClassicCard, WidgetSleek, WidgetMinimalist, WidgetCompactGrid, WidgetUnlock } from "@/shared/components/bundle-widget";
import { BundleTemplateProps, useEffectiveStyles, useSettingsStore } from "@/features/settings";
import { DEFAULT_LABELS } from "@/features/settings/constants/defaults.constants";
import { PLACEHOLDER_IMAGES } from "@/features/settings/constants/customizer.constants";

const BXGY_PRODUCTS: PreviewProduct[] = [
    {
        id: "trigger-1",
        title: "Trigger Product A",
        image: PLACEHOLDER_IMAGES[1],
        price: "$250",
        quantity: 1,
        role: "TRIGGER",
    },
    {
        id: "trigger-2",
        title: "Trigger Product B",
        image: PLACEHOLDER_IMAGES[2],
        price: "$180",
        quantity: 1,
        role: "TRIGGER",
    },
    {
        id: "reward-1",
        title: "Reward Product C",
        image: PLACEHOLDER_IMAGES[1],
        price: "$100",
        compareAtPrice: "$200",
        quantity: 1,
        role: "REWARD",
    },
];

const BXGY_PRICING: WidgetPricing = {
    originalPrice: "$630.00",
    finalPrice: "$530.00",
    savingsAmount: "$100.00",
    savingsPercentage: 16,
    hasDiscount: true,
};

export function TemplateBuyGet({ activeLayout }: BundleTemplateProps) {
    const styles = useEffectiveStyles();
    const serverData = useSettingsStore((s) => s.serverData);
    const labels = {
        ...DEFAULT_LABELS,
        ...(serverData?.labels as Partial<typeof DEFAULT_LABELS>),
        bogoTriggerBadgeText: "You Buy",
        bogoRewardBadgeText: "50% Off",
    };

    const layoutProps = {
        products: BXGY_PRODUCTS,
        styles,
        displayOptions: DEFAULT_DISPLAY_OPTIONS,
        showEmptyState: false,
        pricing: BXGY_PRICING,
        cartButtonText: "Claim This Offer",
        title: "Buy 2 Get 1 Free",
        subtitle: "Mix and match your favorites",
        badgeText: "BXGY DEAL",
        labels,
    };

    switch (activeLayout) {
        case "SLEEK":
            return <WidgetSleek {...layoutProps} />;
        case "COMPACT_GRID":
            return <WidgetCompactGrid {...layoutProps} />;
        case "MINIMALIST":
            return <WidgetMinimalist {...layoutProps} />;
        case "UNLOCK":
            return <WidgetUnlock {...layoutProps} />;
        case "CLASSIC_CARD":
        default:
            return <WidgetClassicCard {...layoutProps} />;
    }
}
