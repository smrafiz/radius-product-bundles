/**
 * Analytics metrics types
 */
import { MetricFormat } from "@/shared";

/**
 * Processed analytics metrics
 */
export interface AnalyticsMetricsData {
    totalRevenue: number;
    revenueAllTime: number;
    totalViews: number;
    avgConversionRate: number;
    totalBundles: number;
    activeBundles: number;
    revenueGrowth: number;
    conversionGrowth: number;
    cartConversionRate: number;
    totalPurchases: number;
    avgOrderValue: number;
    totalAddToCarts: number;
}

/**
 * Analytics metric configuration
 */
export interface AnalyticsMetricConfig {
    key: keyof AnalyticsMetricsData;
    title: string;
    format: MetricFormat;
    icon: "arrow-up" | "arrow-down" | "work-list";
    tone:
        | "success"
        | "info"
        | "critical"
        | "warning"
        | "auto"
        | "neutral"
        | "caution"
        | undefined;
    comparisonLabel?: string;
    action?: { label: string; url: string };
}
