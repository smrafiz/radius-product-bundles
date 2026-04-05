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
            {/* CSS-only billing toggle */}
            <div className="flex items-center justify-center gap-3">
                <span className={`text-sm font-medium ${isMonthly ? "text-gray-900" : "text-gray-400"}`}>
                    {t("billingMonthly")}
                </span>
                <button
                    type="button"
                    role="switch"
                    aria-checked={!isMonthly}
                    aria-label={t("toggleBillingInterval")}
                    onClick={() =>
                        setBillingInterval(isMonthly ? "ANNUAL" : "EVERY_30_DAYS")
                    }
                    className="relative inline-flex h-6 w-11 items-center rounded-full border border-gray-300 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500 focus-visible:ring-offset-2"
                    style={{ background: !isMonthly ? "#16a34a" : "#e5e7eb" }}
                >
                    <span
                        className="inline-block h-4 w-4 rounded-full bg-white shadow transition-transform duration-200"
                        style={{ transform: !isMonthly ? "translateX(22px)" : "translateX(2px)" }}
                    />
                </button>
                <span className={`text-sm font-medium ${!isMonthly ? "text-gray-900" : "text-gray-400"}`}>
                    {t("billingAnnual")}{" "}
                    <s-badge tone="success">{t("annualSavings")}</s-badge>
                </span>
            </div>

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
