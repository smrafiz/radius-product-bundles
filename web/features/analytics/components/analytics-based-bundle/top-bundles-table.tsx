"use client";

import { useTopBundles } from "@/features/analytics";
import { formatCurrencyCompact, formatNumber } from "@/shared";

/**
 * Calculate Average Order Value
 */
function calculateAOV(revenue: number, purchases: number): string {
    if (purchases === 0) {
        return "$0";
    }

    return formatCurrencyCompact(revenue / purchases);
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
function EmptyState() {
    return (
        <s-section>
            <s-stack gap="base" alignItems="center">
                <s-icon type="product" />
                <s-stack gap="small-300" alignItems="center">
                    <s-heading>No bundle data yet</s-heading>
                    <s-text tone="neutral">
                        Bundle performance will appear here once you have at
                        least 10 views and 1 purchase per bundle.
                    </s-text>
                </s-stack>
            </s-stack>
        </s-section>
    );
}

/**
 * Top Performing Bundles Table
 */
export function TopBundlesTable() {
    const { data: bundles, error } = useTopBundles(10);

    // if (isLoading) {
    //     return <BundleTableSkeleton />;
    // }

    if (error) {
        return (
            <s-section>
                <s-banner tone="critical">
                    <s-text>
                        Failed to load bundle performance data. Please try
                        again.
                    </s-text>
                </s-banner>
            </s-section>
        );
    }

    if (!bundles || bundles.length === 0) {
        return <EmptyState />;
    }

    return (
        <s-section padding="none">
            <s-box
                padding="base"
                border="base"
                borderStyle="none none solid none"
            >
                <s-stack gap="small-200">
                    <s-stack
                        direction="inline"
                        gap="small-200"
                        alignItems="center"
                    >
                        <s-heading>Top Performing Bundles</s-heading>
                        <s-icon
                            tone="neutral"
                            type="info"
                            interestFor="top-bundle-tooltip"
                        />
                        <s-tooltip id="top-bundle-tooltip">
                            <s-text>
                                Bundles are ranked by total revenue. Low-traffic
                                bundles are excluded to avoid noise. Trends
                                compare current period with previous period of
                                equal length.
                            </s-text>
                        </s-tooltip>
                    </s-stack>
                </s-stack>
            </s-box>

            {/* Table */}
            <s-table>
                <s-table-header-row>
                    <s-table-header listSlot="primary">Bundle</s-table-header>
                    <s-table-header listSlot="inline">
                        Assessment
                    </s-table-header>
                    <s-table-header listSlot="labeled">
                        Revenue + AOV
                    </s-table-header>
                    <s-table-header listSlot="labeled">Orders</s-table-header>
                    <s-table-header listSlot="labeled">Views</s-table-header>
                    <s-table-header listSlot="labeled">
                        Conversion
                    </s-table-header>
                </s-table-header-row>

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
                                            {bundle.title}
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
                                                            ".125rem dotted var(--p-color-border-tertiary)",
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
                                                {formatCurrencyCompact(
                                                    bundle.revenue,
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
                                        {formatNumber(bundle.purchases)}
                                    </s-text>
                                </s-table-cell>

                                {/* Views (muted, right-aligned) */}
                                <s-table-cell>
                                    <s-text tone="neutral">
                                        {formatNumber(bundle.views)}
                                    </s-text>
                                </s-table-cell>

                                {/* Conversion with sample size */}
                                <s-table-cell>
                                    <s-stack gap="small-200" direction="inline">
                                        <s-badge tone={conversionTone}>
                                            {bundle.conversionRate}%
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
                                                            ? "Low sample size - conversion rate may fluctuate"
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
