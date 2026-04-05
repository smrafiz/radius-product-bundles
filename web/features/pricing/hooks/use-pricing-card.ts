"use client";

import { useState } from "react";
import { useTranslations } from "@/lib/i18n/provider";
import { usePlan } from "@/shared/hooks/plan/use-plan";
import { useAppBridge } from "@shopify/app-bridge-react";
import { useGlobalBanner } from "@/shared/hooks/ui/use-global-banner";
import { createSubscriptionAction } from "@/features/pricing/actions/create-subscription.action";
import {
    PRICING_CARD,
    SUBSCRIPTION_PLANS,
    PLAN_PRICING,
    PRO_TRIAL_DAYS,
    type SubscriptionPlanType,
} from "@/features/pricing/constants/pricing.constants";
import type { BillingInterval } from "@/features/pricing/types/pricing.types";

export function usePricingCard() {
    const t = useTranslations("Pricing");
    const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
    const [billingInterval, setBillingInterval] = useState<BillingInterval>("EVERY_30_DAYS");
    const app = useAppBridge();
    const { plan } = usePlan();
    const { showError } = useGlobalBanner();

    const isMonthly = billingInterval === "EVERY_30_DAYS";
    const currentPlanId = plan.id.toLowerCase();

    const handleSubscribe = async (planId: SubscriptionPlanType): Promise<void> => {
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

    return {
        loadingPlan,
        billingInterval,
        setBillingInterval,
        isMonthly,
        currentPlanId,
        handleSubscribe,
        getPrice,
        getAnnualEquivalent,
        getFrequency,
        getTrialBadge,
        getButtonContent,
        getButtonProps,
    };
}
