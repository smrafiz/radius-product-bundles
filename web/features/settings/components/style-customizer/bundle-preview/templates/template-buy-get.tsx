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
    WidgetSplitDeal,
} from "@/shared/components/bundle-widget";
import {
    BundleTemplateProps,
    useEffectiveStyles,
    useSettingsStore,
} from "@/features/settings";
import { usePreviewProducts } from "@/features/settings/hooks/customizer/use-preview-products";
import { PREVIEW_LABELS } from "@/shared/constants/bundle-widget.constants";
import { PLACEHOLDER_IMAGES } from "@/features/settings/constants/customizer.constants";

const BXGY_PLACEHOLDERS: PreviewProduct[] = [
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

export function TemplateBuyGet({
    activeLayout,
    activeDevice,
}: BundleTemplateProps) {
    const styles = useEffectiveStyles();
    const serverData = useSettingsStore((s) => s.serverData);
    const savedLabels = serverData?.labels as
        | Record<string, string>
        | undefined;
    const labels = {
        ...PREVIEW_LABELS,
        ...Object.fromEntries(
            Object.entries(savedLabels ?? {}).filter(([, val]) => val !== ""),
        ),
        bogoTriggerBadgeText: "You Buy",
        bogoRewardBadgeText: "50% Off",
    };

    const products = usePreviewProducts({
        placeholderProducts: BXGY_PLACEHOLDERS,
    });

    const layoutProps = {
        products,
        styles,
        displayOptions: DEFAULT_DISPLAY_OPTIONS,
        showEmptyState: false,
        pricing: BXGY_PRICING,
        cartButtonText: "Claim This Offer",
        title: "Buy 2 Get 1 Free",
        subtitle: "Mix and match your favorites",
        badgeText: "BXGY DEAL",
        labels,
        activeDevice,
        bundleType: "BUY_X_GET_Y",
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
        case "SPLIT_DEAL":
            return <WidgetSplitDeal {...layoutProps} />;
        case "CLASSIC_CARD":
        default:
            return <WidgetClassicCard {...layoutProps} />;
    }
}
