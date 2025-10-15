import { MetricCalculations, MetricGrowth, MetricTotals } from "@/shared";

export interface BundleMetricsData {
    totals: MetricTotals;
    metrics: MetricCalculations;
    growth: MetricGrowth;
}