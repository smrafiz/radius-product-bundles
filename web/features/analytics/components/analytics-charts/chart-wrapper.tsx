"use client";

import { ChartWrapperProps } from "@/features/analytics";

/**
 * Reusable Chart Wrapper
 */
export function ChartWrapper({
    title,
    summaryStats,
    children,
    isLoading = false,
    gap = "base",
}: ChartWrapperProps) {
    return (
        <s-section>
            <s-stack gap={gap}>
                {/* Title */}
                <s-heading>{title}</s-heading>

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
