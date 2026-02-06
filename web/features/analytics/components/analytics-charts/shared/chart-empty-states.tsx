"use client";

/**
 * Empty State Components for Analytics Charts
 */

import { useAppNavigation } from "@/shared";
import { ChartEmptyStateProps } from "@/features/analytics/types";

/**
 * Generic Empty State Component
 *
 * Base component for all empty states with icon, title, description, and optional action
 */
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

/**
 * No Data State
 *
 * When there's no analytics data at all
 */
export function NoDataState() {
    return (
        <EmptyState
            icon="chart-vertical"
            title="No data available"
            description="Analytics data will appear here once your bundles start getting views and purchases."
        />
    );
}

/**
 * Insufficient Data State
 *
 * When there are fewer than 2 data points
 */
export function InsufficientDataState({
    currentPoints,
}: {
    currentPoints: number;
}) {
    return (
        <EmptyState
            icon="clock"
            title="Collecting more data"
            description={`Need at least 2 days of data to show trends. Currently have ${currentPoints} day${currentPoints !== 1 ? "s" : ""}. Check back tomorrow for your analytics!`}
        />
    );
}

/**
 * No Activity State
 *
 * When all values are zero
 */
export function NoActivityState({
    onViewBundles,
}: {
    onViewBundles?: () => void;
}) {
    return (
        <EmptyState
            icon="product"
            title="No bundle activity yet"
            description="Your bundles haven't been viewed yet. Share them with customers to start tracking performance."
            action={
                onViewBundles
                    ? {
                          label: "View bundles",
                          onClick: onViewBundles,
                          variant: "primary",
                      }
                    : undefined
            }
        />
    );
}

/**
 * No Conversions State
 *
 * For conversion rate chart when there are views but no add-to-carts
 */
export function NoConversionsState({
    onLearnMore,
}: {
    onLearnMore?: () => void;
}) {
    return (
        <EmptyState
            icon="cart"
            title="No conversions yet"
            description="Your bundles have views but no add-to-cart actions yet. Consider optimizing your bundle presentation."
            action={
                onLearnMore
                    ? {
                          label: "Learn about optimization",
                          onClick: onLearnMore,
                          variant: "secondary",
                      }
                    : undefined
            }
        />
    );
}

/**
 * No Purchases State
 *
 * For revenue chart when there are views/carts but no purchases
 */
export function NoPurchasesState() {
    return (
        <EmptyState
            icon="orders"
            title="No purchases yet"
            description="Your bundles have been viewed but haven't been purchased yet. Keep promoting them to your customers!"
        />
    );
}

/**
 * Date Range Too Short Banner
 *
 * Warning banner when selected date range is too short
 */
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

/**
 * Limited Data Warning Banner
 *
 * Info banner when data exists but volume is low
 */
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

/*
 * Message when a time period selected
 */
export function InfoDuringTimePeriod({ message }: { message: string }) {
    return (
        <s-banner tone="info">
            <s-text>{message}</s-text>
        </s-banner>
    );
}

/**
 * Analytics Disabled Banner
 *
 * Warning when tracking is paused in settings
 */
export function AnalyticsDisabledBanner() {
    const { settings } = useAppNavigation();

    return (
        <s-banner tone="warning" heading="Analytics tracking is paused">
            <s-paragraph>
                Tracking is currently paused. New events are not being
                collected, so recent bundle interactions will not appear in
                these reports. All data displayed here reflects activity
                recorded before tracking was disabled.
            </s-paragraph>
            <s-button
                slot="secondary-actions"
                variant="secondary"
                onClick={() => settings()}
            >
                Enable tracking
            </s-button>
        </s-banner>
    );
}
