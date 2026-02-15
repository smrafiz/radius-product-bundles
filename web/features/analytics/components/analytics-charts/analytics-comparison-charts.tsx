"use client";

import {
    ConversionRatesChart,
    FunnelPerformanceChart,
    RevenueAOVChart,
} from "@/features/analytics";

/**
 * Analytics Comparison Charts
 */
export function AnalyticsComparisonCharts() {
    return (
        <s-stack gap="base">
            <s-grid gap="base" gridTemplateColumns="repeat(2, 1fr)">
                <s-grid-item>
                    <FunnelPerformanceChart />
                </s-grid-item>

                <s-grid-item>
                    <ConversionRatesChart />
                </s-grid-item>
            </s-grid>
            <RevenueAOVChart />
        </s-stack>
    );
}
