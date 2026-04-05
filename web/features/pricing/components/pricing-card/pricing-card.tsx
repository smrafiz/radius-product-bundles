"use client";

import {
    PRICING_CARD,
    SUBSCRIPTION_PLANS,
    PLAN_PRICING,
    PRO_TRIAL_DAYS,
    SubscriptionPlanType,
    PricingCardItem,
    BillingInterval,
} from "@/features/pricing";
import { useState } from "react";
import { useTranslations } from "@/lib/i18n/provider";
import { usePlan } from "@/shared/hooks/plan/use-plan";
import { useAppBridge } from "@shopify/app-bridge-react";
import { useGlobalBanner } from "@/shared/hooks/ui/use-global-banner";
import { createSubscriptionAction } from "@/features/pricing/actions/create-subscription.action";

export const PricingCard = () => {
    const t = useTranslations("Pricing");
    const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
    const [billingInterval, setBillingInterval] = useState<BillingInterval>("EVERY_30_DAYS");
    const app = useAppBridge();
    const { plan } = usePlan();
    const { showError } = useGlobalBanner();

    const isMonthly = billingInterval === "EVERY_30_DAYS";
    const currentPlanId = plan.id.toLowerCase();

    const handleSubscribe = async (planId: SubscriptionPlanType) => {
        setLoadingPlan(planId);
        try {
            const sessionToken = await app.idToken();

            if (planId === SUBSCRIPTION_PLANS.FREE) {
                const res = await fetch("/api/billing/cancel", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${sessionToken}`,
                    },
                });
                if (!res.ok) throw new Error("Cancel failed");
                window.location.reload();
                return;
            }

            const result = await createSubscriptionAction(sessionToken, planId, billingInterval);
            if (result.status === "success" && result.confirmationUrl) {
                window.open(result.confirmationUrl, "_top");
            }
        } catch {
            showError(t("subscriptionError"));
        } finally {
            setLoadingPlan(null);
        }
    };

    const getPrice = (planId: string): string => {
        if (planId === SUBSCRIPTION_PLANS.FREE) return "$0";
        const pricing = PLAN_PRICING[planId as SubscriptionPlanType];
        if (!pricing) return "$0";
        if (isMonthly) return `$${pricing.monthly.price.toFixed(2)}`;
        const monthlyEquiv = (pricing.annual.price / 12).toFixed(2);
        return `$${monthlyEquiv}`;
    };

    const getAnnualEquivalent = (planId: string): string | undefined => {
        if (isMonthly || planId === SUBSCRIPTION_PLANS.FREE) return undefined;
        const pricing = PLAN_PRICING[planId as SubscriptionPlanType];
        if (!pricing) return undefined;
        return t("annualBilledLabel", { price: `$${pricing.annual.price.toFixed(2)}` });
    };

    const getFrequency = (planId: string): string => {
        if (!isMonthly && planId !== SUBSCRIPTION_PLANS.FREE) {
            return t("plans.year");
        }
        return t("plans.month");
    };

    const getTrialBadge = (planId: string): string | undefined => {
        if (planId !== SUBSCRIPTION_PLANS.PRO) return undefined;
        if (currentPlanId === SUBSCRIPTION_PLANS.PRO) return undefined;
        return t("trialBadge", { days: String(PRO_TRIAL_DAYS) });
    };

    const getButtonContent = (planId: string): string => {
        if (currentPlanId === planId) {
            return t("currentPlan");
        }
        if (planId === SUBSCRIPTION_PLANS.FREE) {
            return t("downgradeFree");
        }
        if (loadingPlan === planId) {
            return t("pleaseWait");
        }
        return t(`plans.${planId}.button`);
    };

    const getButtonProps = (planId: string) => {
        const baseProps = PRICING_CARD.find((p) => p.id === planId)
            ?.primaryButton.props ?? { variant: "primary" as const };

        if (currentPlanId === planId) {
            return { ...baseProps, variant: "secondary" as const, disabled: true };
        }
        if (planId === SUBSCRIPTION_PLANS.FREE) {
            return { ...baseProps, variant: "secondary" as const, disabled: false };
        }
        return baseProps;
    };

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
