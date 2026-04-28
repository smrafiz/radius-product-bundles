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
    PRO_MONTHLY_PRICE,
    PRO_ANNUAL_PRICE,
    PRO_TRIAL_DAYS,
    type SubscriptionPlanType,
} from "@/features/pricing/constants/pricing.constants";
import { useBillingStatus } from "@/features/pricing/hooks/use-billing-status";
import type { BillingInterval } from "@/prisma/generated/client";

export function usePricingCard() {
    const t = useTranslations("Pricing");
    const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
    const [billingInterval, setBillingInterval] = useState<BillingInterval>("EVERY_30_DAYS");
    const app = useAppBridge();
    const { plan, isLoading: isPlanLoading } = usePlan();
    const { billingData } = useBillingStatus();
    const trialUsed = billingData?.trialUsed ?? false;
    const { showError } = useGlobalBanner();

    const isMonthly = billingInterval === "EVERY_30_DAYS";
    const annualSavingsPercent = Math.round(
        ((PRO_MONTHLY_PRICE * 12 - PRO_ANNUAL_PRICE) / (PRO_MONTHLY_PRICE * 12)) * 100
    );
    const currentPlanId = plan.id.toLowerCase();
    const currentInterval = billingData?.subscription?.interval ?? null;

    // For PRO, "current" requires plan + interval match.
    // For FREE, plan match is sufficient (no interval).
    const isCurrentPlan = (planId: string): boolean => {
        if (currentPlanId !== planId) return false;
        if (planId === SUBSCRIPTION_PLANS.FREE) return true;
        return currentInterval === billingInterval;
    };

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
                if (!res.ok) {
                    const body = (await res.json().catch(() => ({}))) as { error?: string };
                    throw new Error(body.error ?? `Cancel failed: ${res.status}`);
                }
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
        if (trialUsed) return undefined;
        return t("trialBadge", { days: String(PRO_TRIAL_DAYS) });
    };

    // True when merchant is on PRO but viewing the other interval card.
    const isIntervalSwitch = (planId: string): boolean => {
        return (
            planId === SUBSCRIPTION_PLANS.PRO &&
            currentPlanId === SUBSCRIPTION_PLANS.PRO &&
            currentInterval !== null &&
            currentInterval !== billingInterval
        );
    };

    const getButtonContent = (planId: string): string => {
        if (loadingPlan === planId) {
            return t("pleaseWait");
        }
        if (isCurrentPlan(planId)) {
            return t("currentPlan");
        }
        if (isIntervalSwitch(planId)) {
            return isMonthly ? t("switchToMonthly") : t("switchToAnnual");
        }
        if (planId === SUBSCRIPTION_PLANS.FREE) {
            return t("downgradeFree");
        }
        if (planId === SUBSCRIPTION_PLANS.PRO && trialUsed) {
            return t("upgradePro");
        }
        return t(`plans.${planId}.button`);
    };

    const getButtonProps = (planId: string) => {
        const baseProps = PRICING_CARD.find((p) => p.id === planId)
            ?.primaryButton.props ?? { variant: "primary" as const };

        if (isCurrentPlan(planId)) {
            return { ...baseProps, variant: "secondary" as const, disabled: true };
        }
        if (planId === SUBSCRIPTION_PLANS.FREE) {
            return { ...baseProps, variant: "secondary" as const, disabled: false };
        }
        return baseProps;
    };

    return {
        loadingPlan,
        isPlanLoading,
        billingInterval,
        setBillingInterval,
        isMonthly,
        annualSavingsPercent,
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
