"use client";

import { useBillingStatus } from "@/features/pricing";
import { useTranslations } from "@/lib/i18n/provider";
import { usePlan, QuotaBar, ROUTES, useAppNavigation, SkeletonLines } from "@/shared";

export function PlanStatusCard() {
    const t = useTranslations("Pricing.PlanStatus");
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

    if (isLoading) {
        return (
            <s-section padding="base">
                <SkeletonLines lines={3} />
            </s-section>
        );
    }

    return (
        <s-section padding="base">
            <div className="flex items-start justify-between gap-4">
                {/* Left: plan info */}
                <div className="flex flex-col gap-3 flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-base font-semibold text-gray-900">
                            {isPro ? t("proPlan") : t("freePlan")}
                        </span>
                        <s-badge tone={isPro ? "success" : "neutral"}>
                            {plan.name}
                        </s-badge>
                        {isInTrial && (
                            <s-badge tone="info">
                                {t("trialDaysLeft", { days: String(daysLeft) })}
                            </s-badge>
                        )}
                    </div>

                    {/* Bundle usage bar — only shown on Free (quota.bundles.limit !== -1) */}
                    {!isPro && (
                        <div className="max-w-sm">
                            <QuotaBar resource="bundles" label={t("bundlesLabel")} />
                        </div>
                    )}

                    {/* Pro billing details */}
                    {isPro && sub && (
                        <div className="flex gap-6 text-sm text-gray-600">
                            <span>
                                {sub.interval === "ANNUAL" ? t("billingAnnual") : t("billingMonthly")}
                                {sub.price ? ` · $${parseFloat(sub.price).toFixed(2)}` : ""}
                            </span>
                            {sub.currentPeriodEnd && (
                                <span>{t("nextBilling", { date: formatDate(sub.currentPeriodEnd) })}</span>
                            )}
                        </div>
                    )}
                </div>

                {/* Right: CTA */}
                <div className="shrink-0">
                    {!isPro ? (
                        <s-button variant="primary" onClick={goTo(ROUTES.PRICING)}>
                            {t("upgradeToPro")}
                        </s-button>
                    ) : (
                        <s-button variant="secondary" onClick={goTo(ROUTES.PRICING)}>
                            {t("manageSubscription")}
                        </s-button>
                    )}
                </div>
            </div>
        </s-section>
    );
}
