/**
 * Analytics metrics types
 */
import { Bundle } from "@/features/bundles";
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
}

/**
 * Analytics metric configuration
 */
export interface AnalyticsMetricConfig {
    key: keyof AnalyticsMetricsData;
    title: string;
    format: MetricFormat;
    svg_icon: string;
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
}
