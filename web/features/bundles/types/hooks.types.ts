/*
 * Hooks types
 */

import { MetricCalculations, MetricGrowth, MetricTotals } from "@/shared";
import { BundleType } from "@/features/bundles";

/*
 * Bundle metrics data
 */
export interface BundleMetricsData {
    totals: MetricTotals;
    metrics: MetricCalculations;
    growth: MetricGrowth;
}

/*
 * Use bundle form manager options
 */
export interface UseBundleFormManagerOptions {
    bundleType: BundleType;
    bundleName?: string;
}