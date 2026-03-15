"use client";

import { useAppNavigation } from "@/shared";
import { useTranslations } from "@/lib/i18n/provider";
import { ChartEmptyStateProps } from "@/features/analytics/types";

export function EmptyState({
    icon = "chart-horizontal",
    title,
    description,
    action,
}: ChartEmptyStateProps) {
    return (
        <s-section>
            <s-stack gap="base" alignItems="center" padding="large">
                <s-icon type={icon as any} />
                <s-stack gap="small-200" alignItems="center">
                    <s-heading>{title}</s-heading>
                    <s-text tone="info">{description}</s-text>
                </s-stack>
                {action && (
                    <s-button
                        variant={action.variant || "primary"}
                        onClick={action.onClick}
                    >
                        {action.label}
                    </s-button>
                )}
            </s-stack>
        </s-section>
    );
}

export function NoDataState() {
    const t = useTranslations("Analytics.EmptyStates");
    return (
        <EmptyState
            icon="chart-vertical"
            title={t("noDataTitle")}
            description={t("noDataDesc")}
        />
    );
}

export function InsufficientDataState({
    currentPoints,
}: {
    currentPoints: number;
}) {
    const t = useTranslations("Analytics.EmptyStates");
    return (
        <EmptyState
            icon="clock"
            title={t("collectingTitle")}
            description={`Need at least 2 days of data to show trends. Currently have ${currentPoints} day${currentPoints !== 1 ? "s" : ""}. Check back tomorrow for your analytics!`}
        />
    );
}

export function NoActivityState({
    onViewBundles,
}: {
    onViewBundles?: () => void;
}) {
    const t = useTranslations("Analytics.EmptyStates");
    return (
        <EmptyState
            icon="product"
            title={t("noActivityTitle")}
            description={t("noActivityDesc")}
            action={
                onViewBundles
                    ? {
                          label: t("viewBundles"),
                          onClick: onViewBundles,
                          variant: "primary",
                      }
                    : undefined
            }
        />
    );
}

export function NoConversionsState({
    onLearnMore,
}: {
    onLearnMore?: () => void;
}) {
    const t = useTranslations("Analytics.EmptyStates");
    return (
        <EmptyState
            icon="cart"
            title={t("noConversionsTitle")}
            description={t("noConversionsDesc")}
            action={
                onLearnMore
                    ? {
                          label: t("learnOptimization"),
                          onClick: onLearnMore,
                          variant: "secondary",
                      }
                    : undefined
            }
        />
    );
}

export function NoPurchasesState() {
    const t = useTranslations("Analytics.EmptyStates");
    return (
        <EmptyState
            icon="orders"
            title={t("noPurchasesTitle")}
            description={t("noPurchasesDesc")}
        />
    );
}

export function DateRangeTooShortBanner({ days }: { days: number }) {
    return (
        <s-banner tone="info">
            <s-stack gap="small-200">
                <s-text>
                    Selected date range is too short for trend analysis. Please
                    select at least 2-3 days for meaningful insights.
                </s-text>
                <s-text tone="info">
                    Currently showing {days} day{days !== 1 ? "s" : ""} of data
                </s-text>
            </s-stack>
        </s-banner>
    );
}

export function LimitedDataBanner({
    days,
    minDays = 7,
}: {
    days: number;
    minDays?: number;
}) {
    return (
        <s-banner tone="info">
            <s-text>
                Still collecting data. More accurate insights available after{" "}
                {minDays} days of activity. Currently showing {days} day
                {days !== 1 ? "s" : ""}.
            </s-text>
        </s-banner>
    );
}

export function InfoDuringTimePeriod({ message }: { message: string }) {
    return (
        <s-banner tone="info">
            <s-text>{message}</s-text>
        </s-banner>
    );
}

export function AnalyticsDisabledBanner() {
    const t = useTranslations("Analytics.DisabledBanner");
    const { settings } = useAppNavigation();

    return (
        <s-banner tone="warning" heading={t("heading")}>
            <s-paragraph>
                {t("description")}
            </s-paragraph>
            <s-button
                slot="secondary-actions"
                variant="secondary"
                onClick={() => settings()}
            >
                {t("enableTracking")}
            </s-button>
        </s-banner>
    );
}
