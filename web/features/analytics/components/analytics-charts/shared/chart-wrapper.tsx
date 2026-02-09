"use client";

import {
    ChartTitleTooltip,
    ChartWrapperProps,
    InfoDuringTimePeriod,
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
    showInfoBanner = false,
    infoBannerMessage,
}: ChartWrapperProps) {
    const { chartData } = useAnalytics();

    // Show limited data warning if less than 7 days
    const showLimitedDataWarning = (() => {
        if (!chartData || chartData.length >= 8) {
            return false;
        }

        const hasActivity = chartData.some(
            (point) =>
                (point.views || 0) > 0 ||
                (point.addToCarts || 0) > 0 ||
                (point.purchases || 0) > 0,
        );

        return !hasActivity && chartData.length < 7;
    })();

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
                {showInfoBanner && infoBannerMessage ? (
                    <InfoDuringTimePeriod message={infoBannerMessage} />
                ) : (
                    showLimitedDataWarning && (
                        <LimitedDataBanner
                            days={chartData!.length}
                            minDays={7}
                        />
                    )
                )}

                {/* Summary Stats */}
                {summaryStats && summaryStats.length > 0 && (
                    <s-stack gap="small-200">
                        {summaryStats.map((stat, i) => {
                            // Special case: dot means "empty line"
                            if (stat.label === ".") {
                                return (
                                    <div key={`spacer-${i}`} className="h-5" />
                                );
                            }

                            return (
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
                            );
                        })}
                    </s-stack>
                )}

                {/* Chart */}
                {children}
            </s-stack>
        </s-section>
    );
}
