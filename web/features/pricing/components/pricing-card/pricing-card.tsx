"use client";

import {
    BillingInterval,
    PLAN_PRICING,
    PRICING_CARD,
    PricingCardItem,
    PRO_TRIAL_DAYS,
    SUBSCRIPTION_PLANS,
    SubscriptionPlanType,
} from "@/features/pricing";
import { useState } from "react";
import { useGlobalBanner, usePlan } from "@/shared";
import { useTranslations } from "@/lib/i18n/provider";
import { useAppBridge } from "@shopify/app-bridge-react";
import { createSubscriptionAction } from "@/features/pricing/actions/create-subscription.action";

export const PricingCard = () => {
    const t = useTranslations("Pricing");
    const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
    const [billingInterval, setBillingInterval] =
        useState<BillingInterval>("EVERY_30_DAYS");
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

            const result = await createSubscriptionAction(
                sessionToken,
                planId,
                billingInterval,
            );
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
            return {
                ...baseProps,
                variant: "secondary" as const,
                disabled: true,
            };
        }
        if (planId === SUBSCRIPTION_PLANS.FREE) {
            return {
                ...baseProps,
                variant: "secondary" as const,
                disabled: false,
            };
        }
        return baseProps;
    };

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
                        <s-stack
                            direction="inline"
                            gap="small-200"
                            alignItems="center"
                        >
                            {t("billingAnnual")}
                            <s-badge tone="success">
                                {t("annualSavings")}
                            </s-badge>
                        </s-stack>
                    </s-button>
                </s-stack>
            </s-stack>

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
