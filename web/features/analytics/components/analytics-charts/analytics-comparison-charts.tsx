"use client";

import { ConversionRatesChart, FunnelPerformanceChart, RevenueAOVChart, } from "@/features/analytics";

/**
 * Analytics Comparison Charts
 */
export function AnalyticsComparisonCharts() {
    return (
        <s-stack gap="base">
            <FunnelPerformanceChart />
            <ConversionRatesChart />
            <RevenueAOVChart />
        </s-stack>
    );
}
