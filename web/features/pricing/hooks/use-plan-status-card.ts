"use client";

import { useBillingStatus } from "@/features/pricing/hooks/use-billing-status";
import { usePlan, ROUTES, useAppNavigation } from "@/shared";

export function usePlanStatusCard() {
    const { plan } = usePlan();
    const { billingData, isLoading, trialDaysRemaining } = useBillingStatus();
    const { goTo } = useAppNavigation();

    const isPro = plan.id === "PRO";
    const sub = billingData?.subscription;
    const daysLeft = trialDaysRemaining();
    const isInTrial = typeof daysLeft === "number" && daysLeft > 0;

    const formatDate = (iso: string | null | undefined): string => {
        if (!iso) return "—";
        return new Date(iso).toLocaleDateString(undefined, {
            year: "numeric",
            month: "long",
            day: "numeric",
        });
    };

    const handleUpgrade = goTo(ROUTES.PRICING);
    const handleManage = goTo(ROUTES.PRICING);

    return {
        plan,
        isPro,
        sub,
        daysLeft,
        isInTrial,
        isLoading,
        formatDate,
        handleUpgrade,
        handleManage,
    };
}
