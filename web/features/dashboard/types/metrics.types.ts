/**
 * Dashboard metrics types
 */

/**
 * Processed dashboard metrics
 */
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

/**
 * Raw metrics from API response
 */
export interface DashboardMetricsRaw {
    totals: MetricTotals;
    metrics: MetricCalculations;
    growth: MetricGrowth;
}

/**
 * Metric totals
 */
export interface MetricTotals {
    revenue: number;
    revenueAllTime: number;
    views: number;
    purchases: number;
    addToCarts: number;
    totalBundles: number;
    activeBundles: number;
}

/**
 * Calculated metrics
 */
export interface MetricCalculations {
    conversionRate: number;
    avgOrderValue: number;
    cartConversionRate: number;
}

/**
 * Growth metrics
 */
export interface MetricGrowth {
    revenue: number;
    conversion: number;
}

/**
 * Individual metric card data
 */
export interface MetricCardData {
    title: string;
    value: string | number;
    growth?: number;
    growthLabel?: string;
    comparisonLabel?: string;
    action?: MetricAction;
    tone?: MetricTone;
    icon?: React.ComponentType;
}

/**
 * Metric action
 */
export interface MetricAction {
    label: string;
    url: string;
}

/**
 * Metric tone for styling
 */
export type MetricTone = 'positive' | 'negative' | 'neutral' | 'warning';

/**
 * Time period for metrics
 */
export type MetricsPeriod =
    | 'today'
    | 'yesterday'
    | 'week'
    | 'month'
    | 'quarter'
    | 'year'
    | 'custom';

/**
 * Metric comparison type
 */
export type MetricComparison =
    | 'previous_period'
    | 'previous_year'
    | 'last_month'
    | 'none';

/**
 * Metric filter options
 */
export interface MetricFilters {
    period: MetricsPeriod;
    comparison: MetricComparison;
    startDate?: Date;
    endDate?: Date;
}