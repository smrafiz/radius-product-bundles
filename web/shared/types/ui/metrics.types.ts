/**
 * Metric card props
 */
export interface MetricCardProps {
    title: string;
    value: string | number;
    growth?: number | null;
    subtitle?: string;
    img?: { url: string; alt: string };
    icon?: "arrow-up" | "arrow-down" | "work-list";
    tone?:
        | "success"
        | "info"
        | "critical"
        | "warning"
        | "auto"
        | "neutral"
        | "caution"
        | undefined;
    loading?: boolean;
    action?: {
        label: string;
        url: string;
    };
    comparisonLabel?: string;
}

/**
 * Metric format
 */
export type MetricFormat = "currency" | "percentage" | "number";

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
 * Metric action
 */
export interface MetricAction {
    label: string;
    url: string;
}

/**
 * Metric tone for styling
 */
export type MetricTone = "positive" | "negative" | "neutral" | "warning";

/**
 * Time period for metrics
 */
export type MetricsPeriod =
    | "today"
    | "yesterday"
    | "week"
    | "month"
    | "quarter"
    | "year"
    | "custom";

/**
 * Metric comparison type
 */
export type MetricComparison =
    | "previous_period"
    | "previous_year"
    | "last_month"
    | "none";

/**
 * Metric filter options
 */
export interface MetricFilters {
    period: MetricsPeriod;
    comparison: MetricComparison;
    startDate?: Date;
    endDate?: Date;
}
