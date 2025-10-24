/*
 * Hooks types
 */

import { MetricCalculations, MetricGrowth, MetricTotals } from "@/shared";

/*
 * Bundle metrics data
 */
export interface BundleMetricsData {
    totals: MetricTotals;
    metrics: MetricCalculations;
    growth: MetricGrowth;
}