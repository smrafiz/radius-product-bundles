"use client";

import {
    TopBundlesHeader,
    TopBundlesSkeleton,
    TopBundlesTableHeader,
    useTopBundles,
} from "@/features/analytics";
import { EmptyState, formatByType, useAppNavigation } from "@/shared";
import { useTranslations } from "@/lib/i18n/provider";

/**
 * Calculate Average Order Value
 */
function calculateAOV(revenue: number, purchases: number): string {
    if (purchases === 0) {
        return "$0";
    }

    return formatByType(revenue / purchases, "currency");
}

/**
 * Get trend display
 */
function getTrendDisplay(percentage: number): {
    text: string;
    tone: "success" | "critical" | "neutral";
    isNew: boolean;
} {
    if (percentage === 100) {
        return { text: "New", tone: "neutral", isNew: true };
    }

    if (percentage >= 10) {
        return {
            text: `↗ ${percentage.toFixed(0)}%`,
            tone: "success",
            isNew: false,
        };
    } else if (percentage <= -10) {
        return {
            text: `↘ ${Math.abs(percentage).toFixed(0)}%`,
            tone: "critical",
            isNew: false,
        };
    }

    return {
        text: `${percentage >= 0 ? "+" : ""}${percentage.toFixed(0)}%`,
        tone: "neutral",
        isNew: false,
    };
}

/**
 * Get conversion rate tone based on value
 */
function getConversionTone(rate: number): "success" | "warning" | "neutral" {
    if (rate >= 10) {
        return "success";
    }

    if (rate >= 5) {
        return "warning";
    }

    return "neutral";
}

/**
 * Get the single most important badge for a bundle
 */
function getPrimaryBadge(bundle: any) {
    // Priority: Revenue Star > High Converter > Trending > Hidden Gem
    const badges = bundle.badges || [];

    if (badges.some((b: any) => b.label === "Revenue Star")) {
        return badges.find((b: any) => b.label === "Revenue Star");
    }
    if (badges.some((b: any) => b.label === "High Converter")) {
        return badges.find((b: any) => b.label === "High Converter");
    }
    if (badges.some((b: any) => b.label === "Trending")) {
        return badges.find((b: any) => b.label === "Trending");
    }
    if (badges.some((b: any) => b.label === "Hidden Gem")) {
        return badges.find((b: any) => b.label === "Hidden Gem");
    }

    return null;
}

/**
 * Check if data is statistically weak (low sample size)
 */
function hasLowConfidence(views: number): boolean {
    return views < 25;
}

/**
 * Empty State
 */

/**
 * Top Performing Bundles Table
 */
export function TopBundlesTable() {
    const t = useTranslations("Analytics.TopBundles");
    const ta = useTranslations("Analytics.AllBundles");
    const { data: bundles, isLoading, error } = useTopBundles(5);
    const { bundleData } = useAppNavigation();

    /**
     * Handle bundle name click - navigate to edit page
     */
    const handleBundleClick = (bundleId: string) => {
        bundleData.edit(bundleId);
    };

    if (isLoading) {
        return (
            <TopBundlesSkeleton
                Header={TopBundlesHeader}
                TableHeader={TopBundlesTableHeader}
            />
        );
    }

    if (error) {
        return (
            <s-section padding="none">
                <TopBundlesHeader />
                <s-box padding="base">
                    <s-banner tone="critical">
                        <s-text>
                            Failed to load bundle performance data. Please try
                            again.
                        </s-text>
                    </s-banner>
                </s-box>
            </s-section>
        );
    }

    if (!bundles || bundles.length === 0) {
        return (
            <s-section padding="none">
                <TopBundlesHeader />
                <s-box padding="base">
                    <EmptyState
                        heading={t("noData")}
                        description="Bundle performance will appear here once you have at least 10 views and 1 purchase per bundle."
                    />
                </s-box>
            </s-section>
        );
    }

    return (
        <s-section padding="none">
            <TopBundlesHeader />

            {/* Table */}
            <s-table>
                <TopBundlesTableHeader />

                <s-table-body>
                    {bundles.map((bundle, index) => {
                        const trend = getTrendDisplay(bundle.trendPercentage);
                        const conversionTone = getConversionTone(
                            bundle.conversionRate,
                        );
                        const primaryBadge = getPrimaryBadge(bundle);
                        const aov = calculateAOV(
                            bundle.revenue,
                            bundle.purchases,
                        );
                        const lowConfidence = hasLowConfidence(bundle.views);

                        return (
                            <s-table-row key={bundle.bundleId}>
                                {/* Bundle Name with Rank */}
                                <s-table-cell>
                                    <s-stack
                                        direction="inline"
                                        gap="small-200"
                                        alignItems="center"
                                        padding="small-300"
                                    >
                                        <s-heading>
                                            <s-text
                                                tone={
                                                    index === 0
                                                        ? "success"
                                                        : "neutral"
                                                }
                                            >
                                                <span className="font-semibold mr-1">
                                                    #{index + 1}
                                                </span>
                                            </s-text>
                                            <s-text>
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        handleBundleClick(
                                                            bundle.bundleId,
                                                        )
                                                    }
                                                    className="text-start font-semibold hover:underline cursor-pointer bg-transparent border-none p-0"
                                                >
                                                    {bundle.title}
                                                </button>
                                            </s-text>
                                        </s-heading>
                                    </s-stack>
                                </s-table-cell>

                                {/* Performance Badge Column */}
                                <s-table-cell>
                                    {primaryBadge ? (
                                        <span>
                                            {/*<s-badge tone={primaryBadge.tone}>*/}
                                            <s-text
                                                interestFor={`${bundle.bundleId}-perf-badge-tooltip`}
                                            >
                                                <span
                                                    style={{
                                                        borderBottom:
                                                            ".125rem dotted #cccccc",
                                                        cursor: "help",
                                                        display: "inline-block",
                                                    }}
                                                >
                                                    {" "}
                                                    {primaryBadge.icon}{" "}
                                                    {primaryBadge.label}
                                                </span>
                                            </s-text>
                                            {/*</s-badge>*/}
                                            <s-tooltip
                                                id={`${bundle.bundleId}-perf-badge-tooltip`}
                                            >
                                                <s-text tone="neutral">
                                                    {primaryBadge.tooltip}
                                                </s-text>
                                            </s-tooltip>
                                        </span>
                                    ) : (
                                        <s-text tone="neutral">—</s-text>
                                    )}
                                </s-table-cell>

                                {/* Revenue + AOV + Trend */}
                                <s-table-cell>
                                    <s-stack gap="small-300">
                                        {/* Revenue (bold) */}
                                        <s-text tone="success">
                                            <span className="font-semibold">
                                                {formatByType(
                                                    bundle.revenue,
                                                    "currency",
                                                )}
                                            </span>
                                        </s-text>

                                        {/* AOV (context) */}
                                        <s-text tone="neutral">
                                            {aov} / order
                                        </s-text>

                                        {/* Trend (vs previous period) */}
                                        {!trend.isNew && (
                                            <s-text tone={trend.tone}>
                                                {trend.text} vs prev
                                            </s-text>
                                        )}
                                    </s-stack>
                                </s-table-cell>

                                {/* Orders (right-aligned) */}
                                <s-table-cell>
                                    <s-text type="strong">
                                        {formatByType(
                                            bundle.purchases,
                                            "number",
                                        )}
                                    </s-text>
                                </s-table-cell>

                                {/* Views (muted, right-aligned) */}
                                <s-table-cell>
                                    <s-text tone="neutral">
                                        {formatByType(bundle.views, "number")}
                                    </s-text>
                                </s-table-cell>

                                {/* Conversion with sample size */}
                                <s-table-cell>
                                    <s-stack gap="small-200" direction="inline">
                                        <s-badge tone={conversionTone}>
                                            {formatByType(
                                                bundle.conversionRate,
                                                "percentage",
                                            )}
                                        </s-badge>

                                        {/* Show fraction for transparency */}
                                        {lowConfidence && (
                                            <>
                                                <s-icon
                                                    tone="warning"
                                                    type="alert-triangle"
                                                    interestFor={`${bundle.bundleId}-conversion-tooltip`}
                                                />
                                                <s-tooltip
                                                    id={`${bundle.bundleId}-conversion-tooltip`}
                                                >
                                                    <s-text tone="neutral">
                                                        {lowConfidence
                                                            ? t("lowSampleSize")
                                                            : `Conversion rate based on ${bundle.views} views`}
                                                    </s-text>
                                                </s-tooltip>
                                            </>
                                        )}
                                    </s-stack>
                                </s-table-cell>
                            </s-table-row>
                        );
                    })}
                </s-table-body>
            </s-table>
        </s-section>
    );
}
