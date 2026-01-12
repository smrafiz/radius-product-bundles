"use client";

import {
    ChartTitleTooltip,
    ChartWrapperProps,
    LimitedDataBanner,
    useAnalytics,
} from "@/features/analytics";

/**
 * Reusable Chart Wrapper
 */
export function ChartWrapper({
    title,
    summaryStats,
    description,
    formula,
    children,
    gap = "base",
}: ChartWrapperProps) {
    const { chartData } = useAnalytics();

    // Show limited data warning if less than 7 days
    const showLimitedDataWarning = chartData && chartData.length < 8;

    return (
        <s-section>
            <s-stack gap={gap}>
                {/* Title */}
                <s-heading>
                    <ChartTitleTooltip
                        title={title}
                        description={description}
                        formula={formula}
                    >
                        {title}
                    </ChartTitleTooltip>
                </s-heading>

                {/* Limited data warning */}
                {showLimitedDataWarning && (
                    <LimitedDataBanner days={chartData!.length} minDays={7} />
                )}

                {/* Summary Stats */}
                {summaryStats && summaryStats.length > 0 && (
                    <s-stack gap="small-200">
                        {summaryStats.map((stat) => (
                            <s-stack
                                key={stat.label}
                                direction="inline"
                                justifyContent="space-between"
                                alignItems="center"
                            >
                                <s-text>{stat.label}</s-text>
                                <s-text type="strong" tone="info">
                                    <span className="font-medium">
                                        {typeof stat.value === "number"
                                            ? stat.value.toLocaleString()
                                            : stat.value}
                                    </span>
                                </s-text>
                            </s-stack>
                        ))}
                    </s-stack>
                )}

                {/* Chart */}
                {children}
            </s-stack>
        </s-section>
    );
}
