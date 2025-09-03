export interface DashboardMetrics {
    totalRevenue: number;
    revenueAllTime: number;
    totalViews: number;
    avgConversionRate: number;
    totalBundles: number;
    activeBundles: number;
    revenueGrowth: number;
    conversionGrowth: number;
}

export interface MetricsTotals {
    revenue: number;
    views: number;
    conversions: number;
    orders: number;
}

export interface MetricsData {
    conversionRate: number;
    averageOrderValue: number;
    clickThroughRate: number;
}

export interface MetricsGrowth {
    revenue: number;
    conversion: number;
    views: number;
}

export interface BundleMetricsResponse {
    totals: MetricsTotals;
    metrics: MetricsData;
    growth: MetricsGrowth;
}

export interface AnalyticsTimeframe {
    start: string;
    end: string;
    period: "day" | "week" | "month" | "quarter" | "year";
}
