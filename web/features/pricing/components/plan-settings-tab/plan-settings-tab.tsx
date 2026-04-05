"use client";

import { useState } from "react";
import { useTranslations } from "@/lib/i18n/provider";
import { usePlan } from "@/shared/hooks/plan/use-plan";
import { useBillingStatus } from "@/features/pricing";
import { ROUTES } from "@/shared/constants/routes.constants";
import { SkeletonLines, useAppNavigation, useGlobalBanner } from "@/shared";

const CANCEL_MODAL_ID = "plan-cancel-subscription-modal";

export function PlanSettingsTab() {
    const t = useTranslations("Pricing.PlanTab");
    const { plan } = usePlan();
    const { billingData, isLoading, cancel, trialDaysRemaining } =
        useBillingStatus();
    const { showSuccess, showError } = useGlobalBanner();
    const { goTo } = useAppNavigation();
    const [cancelling, setCancelling] = useState(false);

    const isPro = plan.id === "PRO";
    const sub = billingData?.subscription;
    const daysLeft = trialDaysRemaining();
    const isInTrial = typeof daysLeft === "number";
    const interval = sub?.interval ?? null;

    const handleCancelConfirm = async () => {
        setCancelling(true);
        try {
            await cancel();
            showSuccess(t("cancelSuccess"));
        } catch {
            showError(t("cancelError"));
        } finally {
            setCancelling(false);
        }
    };

    const formatDate = (iso: string | null | undefined): string => {
        if (!iso) return "\u2014";
        return new Date(iso).toLocaleDateString(undefined, {
            year: "numeric",
            month: "long",
            day: "numeric",
        });
    };

    if (isLoading) {
        return (
            <s-section padding="base">
                <div className="p-2">
                    <SkeletonLines lines={4} random={false} />
                </div>
            </s-section>
        );
    }

    return (
        <>
            <s-section padding="base">
                <s-stack direction="block" gap="large">
                    <s-stack
                        direction="inline"
                        gap="base"
                        alignItems="center"
                        justifyContent="space-between"
                    >
                        <s-stack direction="block" gap="small-200">
                            <s-heading>
                                <span className="font-semibold">
                                    {isPro ? t("proPlan") : t("freePlan")}
                                </span>
                            </s-heading>
                            <s-stack
                                direction="inline"
                                gap="small-200"
                                alignItems="center"
                            >
                                <s-badge tone={isPro ? "success" : "neutral"}>
                                    {isPro
                                        ? t("statusActive")
                                        : t("statusFree")}
                                </s-badge>
                                {isInTrial && (
                                    <s-badge tone="info">
                                        {t("trialDaysLeft", {
                                            days: String(daysLeft),
                                        })}
                                    </s-badge>
                                )}
                            </s-stack>
                        </s-stack>

                        {!isPro && (
                            <s-button
                                variant="primary"
                                onClick={goTo(ROUTES.PRICING)}
                            >
                                {t("upgradeToPro")}
                            </s-button>
                        )}
                    </s-stack>

                    {isPro && sub && (
                        <>
                            <s-divider />
                            <s-grid gridTemplateColumns="1fr 1fr" gap="base">
                                <s-stack direction="block" gap="small-200">
                                    <s-text tone="neutral">
                                        {t("billingInterval")}
                                    </s-text>
                                    <s-text>
                                        {interval === "ANNUAL"
                                            ? t("annual")
                                            : t("monthly")}
                                    </s-text>
                                </s-stack>
                                <s-stack direction="block" gap="small-200">
                                    <s-text tone="neutral">
                                        {t("nextBillingDate")}
                                    </s-text>
                                    <s-text>
                                        {formatDate(sub.currentPeriodEnd)}
                                    </s-text>
                                </s-stack>
                                <s-stack direction="block" gap="small-200">
                                    <s-text tone="neutral">{t("price")}</s-text>
                                    <s-text>
                                        {sub.price
                                            ? `$${parseFloat(sub.price).toFixed(2)} ${sub.currencyCode ?? ""}`
                                            : "\u2014"}
                                    </s-text>
                                </s-stack>
                            </s-grid>
                            <s-divider />
                            <s-stack direction="inline" gap="base">
                                <s-button
                                    tone="neutral"
                                    variant="secondary"
                                    onClick={goTo(ROUTES.PRICING)}
                                >
                                    {interval === "ANNUAL"
                                        ? t("switchToMonthly")
                                        : t("switchToAnnual")}
                                </s-button>
                                <s-button
                                    tone="critical"
                                    variant="secondary"
                                    commandFor={CANCEL_MODAL_ID}
                                >
                                    {t("cancelSubscription")}
                                </s-button>
                            </s-stack>
                        </>
                    )}
                </s-stack>
            </s-section>

            <s-modal
                id={CANCEL_MODAL_ID}
                accessibilityLabel={t("cancelModalTitle")}
                heading={t("cancelModalTitle")}
                size="small"
            >
                <s-stack direction="block" gap="base">
                    <s-text>{t("cancelModalBody")}</s-text>
                    <s-stack direction="inline" gap="base" justifyContent="end">
                        <s-button
                            variant="secondary"
                            commandFor={CANCEL_MODAL_ID}
                            disabled={cancelling}
                        >
                            {t("cancelModalKeep")}
                        </s-button>
                        <s-button
                            tone="critical"
                            loading={cancelling}
                            disabled={cancelling}
                            onClick={handleCancelConfirm}
                        >
                            {t("cancelModalConfirm")}
                        </s-button>
                    </s-stack>
                </s-stack>
            </s-modal>
        </>
    );
}
