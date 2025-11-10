/**
 * Dashboard metrics types
 */

import {
    MetricCalculations,
    MetricFormat,
    MetricGrowth,
    MetricTotals,
} from "@/shared";

/**
 * Processed dashboard metrics
 */
export interface DashboardMetricsData {
    totalRevenue: number;
    revenueAllTime: number;
    totalViews: number;
    avgConversionRate: number;
    totalBundles: number;
    activeBundles: number;
    revenueGrowth: number;
    conversionGrowth: number;
}

/**
 * Dashboard metric configuration
 */
export interface DashboardMetricConfig {
    key: keyof DashboardMetricsData;
    title: string;
    format: MetricFormat;
    svg_icon: string;
    icon: "arrow-up" | "arrow-down" | "work-list";
    tone: "success" | "info" | "critical" | "warning" | "auto" | "neutral" | "caution" | undefined;
    comparisonLabel?: string;
    action?: { label: string; url: string };
}

/**
 * Raw metrics from API response
 */
export interface DashboardMetricsRaw {
    totals: MetricTotals;
    metrics: MetricCalculations;
    growth: MetricGrowth;
}
