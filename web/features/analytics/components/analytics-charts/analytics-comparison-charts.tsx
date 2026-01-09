"use client";

import { FunnelPerformanceChart } from "./funnel-performance-chart";
import { ConversionRatesChart } from "./conversion-rates-chart";
import { RevenueAOVChart } from "./revenue-aov-chart";

/**
 * Analytics Comparison Charts
 *
 * Displays three key comparison charts in a 2-column grid:
 * - Funnel Performance (Views → Add-to-Cart → Purchases)
 * - Conversion Rates (View-to-Cart % + Cart-to-Purchase %)
 * - Revenue + AOV (Revenue bars + Average Order Value line)
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
