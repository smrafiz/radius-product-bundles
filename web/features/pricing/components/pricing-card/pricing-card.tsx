"use client";

import { PRICING_CARD, SubscriptionPlanType, PricingCardItem } from "@/features/pricing";
import { useTranslations } from "@/lib/i18n/provider";
import { usePricingCard } from "@/features/pricing/hooks/use-pricing-card";

export const PricingCard = () => {
    const t = useTranslations("Pricing");
    const {
        loadingPlan,
        billingInterval,
        setBillingInterval,
        isMonthly,
        handleSubscribe,
        getPrice,
        getAnnualEquivalent,
        getFrequency,
        getTrialBadge,
        getButtonContent,
        getButtonProps,
    } = usePricingCard();

    return (
        <s-stack direction="block" gap="large">
            <s-stack direction="inline" justifyContent="center">
                <s-stack
                    direction="inline"
                    gap="none"
                    borderRadius="base"
                    padding="small-200"
                    background="base"
                >
                    <s-button
                        variant={isMonthly ? "secondary" : "tertiary"}
                        onClick={() => setBillingInterval("EVERY_30_DAYS")}
                    >
                        {t("billingMonthly")}
                    </s-button>
                    <s-button
                        variant={!isMonthly ? "secondary" : "tertiary"}
                        onClick={() => setBillingInterval("ANNUAL")}
                    >
                        {t("billingAnnual")}
                    </s-button>
                </s-stack>
            </s-stack>

            {/* Plan cards */}
            <div
                key={billingInterval}
                className="grid gap-4 items-stretch"
                style={{
                    gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
                    animation: "rpbFadeIn 0.15s ease-out",
                }}
            >
                {PRICING_CARD.map((item) => (
                    <div key={item.id} className="flex">
                        <PricingCardItem
                            {...item}
                            title={t(`plans.${item.id}.title`)}
                            description={t(`plans.${item.id}.description`)}
                            featuredText={
                                item.featuredText
                                    ? t(`plans.${item.id}.featured`)
                                    : undefined
                            }
                            trialBadge={getTrialBadge(item.id)}
                            price={getPrice(item.id)}
                            frequency={getFrequency(item.id)}
                            annualEquivalent={getAnnualEquivalent(item.id)}
                            features={item.features}
                            primaryButton={{
                                ...item.primaryButton,
                                content: getButtonContent(item.id),
                                loading: loadingPlan === item.id,
                                props: getButtonProps(item.id),
                            }}
                            onSubscribe={() =>
                                handleSubscribe(item.id as SubscriptionPlanType)
                            }
                        />
                    </div>
                ))}
            </div>
        </s-stack>
    );
};
