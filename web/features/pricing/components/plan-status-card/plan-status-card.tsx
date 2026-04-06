"use client";

import { useTranslations } from "@/lib/i18n/provider";
import { QuotaBar, SkeletonLines } from "@/shared";
import { usePlanStatusCard } from "@/features/pricing/hooks/use-plan-status-card";

export function PlanStatusCard() {
    const t = useTranslations("Pricing.PlanStatus");
    const {
        plan,
        isPro,
        sub,
        isInTrial,
        daysLeft,
        isLoading,
        isStatsLoading,
        formatDate,
        formatCurrency,
        totalRevenue,
        ordersLast30Days,
        activeBundles,
    } = usePlanStatusCard();

    if (isLoading) {
        return (
            <s-section padding="base">
                <SkeletonLines lines={3} />
            </s-section>
        );
    }

    return (
        <s-section padding="base">
            {/* Header row: title + trial badge on left, plan badge on right */}
            <div className="flex items-center justify-between flex-wrap gap-2 mb-4">
                <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-base font-semibold text-gray-900">
                        {t("title")}
                    </span>
                    {isInTrial && (
                        <s-badge tone="info">
                            {t("trialDaysLeft", { days: String(daysLeft) })}
                        </s-badge>
                    )}
                </div>
                <s-badge tone={isPro ? "success" : "neutral"}>
                    {isPro ? t("proPlan") : t("freePlan")}
                </s-badge>
            </div>

            {/* Bundle usage bar — only on Free */}
            {!isPro && (
                <div className="mb-4">
                    <QuotaBar resource="bundles" label={t("bundlesLabel")} />
                </div>
            )}

            {/* Pro billing details */}
            {isPro && sub && (
                <div className="flex gap-6 text-sm text-gray-600 mb-4">
                    <span>
                        {sub.interval === "ANNUAL" ? t("billingAnnual") : t("billingMonthly")}
                        {sub.price ? ` · $${parseFloat(sub.price).toFixed(2)}` : ""}
                    </span>
                    {sub.currentPeriodEnd && (
                        <span>{t("nextBilling", { date: formatDate(sub.currentPeriodEnd) })}</span>
                    )}
                </div>
            )}

            <s-divider />

            {/* Live metrics */}
            <div className="mt-4">
                <s-grid
                    gridTemplateColumns="repeat(auto-fit, minmax(250px, 1fr))"
                    gap="base"
                    justifyContent="center"
                >
                    <s-grid-item>
                        <s-section padding="base">
                            <s-stack gap="small-300">
                                <s-text>{t("statTotalRevenue")}</s-text>
                                <s-heading>
                                    <span style={{ fontSize: "18px", fontWeight: "700" }}>
                                        {isStatsLoading ? "—" : formatCurrency(totalRevenue)}
                                    </span>
                                </s-heading>
                            </s-stack>
                        </s-section>
                    </s-grid-item>
                    <s-grid-item>
                        <s-section padding="base">
                            <s-stack gap="small-300">
                                <s-text>{t("statOrders")}</s-text>
                                <s-heading>
                                    <span style={{ fontSize: "18px", fontWeight: "700" }}>
                                        {isStatsLoading ? "—" : ordersLast30Days.toLocaleString()}
                                    </span>
                                </s-heading>
                            </s-stack>
                        </s-section>
                    </s-grid-item>
                    <s-grid-item>
                        <s-section padding="base">
                            <s-stack gap="small-300">
                                <s-text>{t("statActiveBundles")}</s-text>
                                <s-heading>
                                    <span style={{ fontSize: "18px", fontWeight: "700" }}>
                                        {isStatsLoading ? "—" : activeBundles.toLocaleString()}
                                    </span>
                                </s-heading>
                            </s-stack>
                        </s-section>
                    </s-grid-item>
                </s-grid>
            </div>
        </s-section>
    );
}
