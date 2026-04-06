"use client";

import { useBillingStatus } from "@/features/pricing/hooks/use-billing-status";
import { usePlanStats } from "@/features/pricing/hooks/use-plan-stats";
import { usePlan, ROUTES, useAppNavigation } from "@/shared";

export function usePlanStatusCard() {
    const { plan, isLoading: isPlanLoading } = usePlan();
    const { billingData, isLoading: isBillingLoading, trialDaysRemaining } = useBillingStatus();
    const { totalRevenue, ordersLast30Days, activeBundles, isLoading: isStatsLoading } = usePlanStats();
    const isLoading = isPlanLoading || isBillingLoading;
    const { goTo } = useAppNavigation();

    const isPro = plan.id === "PRO";
    const sub = billingData?.subscription;
    const daysLeft = trialDaysRemaining();
    // Only show trial badge when actively on Pro trial — not on free plan after downgrade
    const isInTrial = isPro && typeof daysLeft === "number" && daysLeft > 0;

    const formatDate = (iso: string | null | undefined): string => {
        if (!iso) return "—";
        return new Date(iso).toLocaleDateString(undefined, {
            year: "numeric",
            month: "long",
            day: "numeric",
        });
    };

    const formatCurrency = (amount: number): string =>
        new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(amount);

    const handleUpgrade = goTo(ROUTES.PRICING);
    const handleManage = goTo(ROUTES.PRICING);

    return {
        plan,
        isPro,
        sub,
        daysLeft,
        isInTrial,
        isLoading,
        isStatsLoading,
        formatDate,
        formatCurrency,
        totalRevenue,
        ordersLast30Days,
        activeBundles,
        handleUpgrade,
        handleManage,
    };
}
