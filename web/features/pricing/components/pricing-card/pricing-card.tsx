"use client";

import { PRICING_CARD, PricingCardItem } from "@/features/pricing";
import { useTranslations } from "@/lib/i18n/provider";

const FEATURE_KEYS = ["orders", "feature1", "feature2", "support"] as const;

export const PricingCard = () => {
    const t = useTranslations("Pricing");

    return (
        <s-grid
            gridTemplateColumns="repeat(auto-fit, minmax(280px, 1fr))"
            gap="base"
            justifyContent="center"
        >
            {PRICING_CARD.map((item) => (
                <s-grid-item key={item.id} gridColumn="auto">
                    <PricingCardItem
                        {...item}
                        title={t(`plans.${item.id}.title`)}
                        description={t(`plans.${item.id}.description`)}
                        featuredText={item.featuredText ? t(`plans.${item.id}.featured`) : undefined}
                        frequency={t(`plans.${item.frequency}`)}
                        features={FEATURE_KEYS.map((key) => t(`plans.features.${key}`))}
                        primaryButton={{
                            ...item.primaryButton,
                            content: t(`plans.${item.id}.button`),
                        }}
                    />
                </s-grid-item>
            ))}
        </s-grid>
    );
};
