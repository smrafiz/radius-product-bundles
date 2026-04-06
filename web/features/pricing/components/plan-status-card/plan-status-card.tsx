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
        daysLeft,
        isInTrial,
        isLoading,
        formatDate,
        handleUpgrade,
        handleManage,
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
            <div className="flex flex-col gap-3 flex-1 min-w-0 mb-4">
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
                    <div className="full">
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
            {/*<div className="shrink-0">*/}
            {/*    {!isPro ? (*/}
            {/*        <s-button variant="primary" onClick={handleUpgrade}>*/}
            {/*            {t("upgradeToPro")}*/}
            {/*        </s-button>*/}
            {/*    ) : (*/}
            {/*        <s-button variant="secondary" onClick={handleManage}>*/}
            {/*            {t("manageSubscription")}*/}
            {/*        </s-button>*/}
            {/*    )}*/}
            {/*</div>*/}

            <s-divider />

            <div className="mt-4">
                <s-grid
                    gridTemplateColumns="repeat(auto-fit, minmax(250px, 1fr))"
                    gap="base"
                    justifyContent="center"
                >
                    <s-grid-item>
                        <s-section padding="base">
                            <s-stack gap="small-300">
                                <s-text>Total orders</s-text>
                                <s-heading><span style={{fontSize: "18px", fontWeight:"700"}}>144</span></s-heading>
                            </s-stack>
                        </s-section>
                    </s-grid-item>
                    <s-grid-item>
                        <s-section padding="base">
                            <s-stack gap="small-300">
                                <s-text>Revenue fron bundles</s-text>
                                <s-heading><span style={{fontSize: "18px", fontWeight:"700"}}>$12345</span></s-heading>
                            </s-stack>
                        </s-section>
                    </s-grid-item>
                    <s-grid-item>
                        <s-section padding="base">
                            <s-stack gap="small-300">
                                <s-text>Avg.bundle value</s-text>
                                <s-heading><span style={{fontSize: "18px", fontWeight:"700"}}>$29.05</span></s-heading>
                            </s-stack>
                        </s-section>
                    </s-grid-item>
                </s-grid>
            </div>
        </s-section>
    );
}
