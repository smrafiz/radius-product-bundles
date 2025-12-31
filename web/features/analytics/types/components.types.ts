/**
 * Analytics component types
 */
import { Bundle } from "@/features/bundles";

/**
 * Analytics-based bundle configuration
 */
export interface AnalyticsBasedBundleConfig {
    name: string;
    views: number;
    sales_value: string;
    sales_number: number;
    status: string;
    tone:
        | "success"
        | "warning"
        | "info"
        | "critical"
        | "neutral"
        | "caution"
        | "auto"
        | undefined;
}

/**
 * Analytics order bundle configuration
 */
export interface AnalyticsOrderBundleConfig {
    order: number;
    order_date: string;
    item: string;
    bundle_total: string;
    order_total: string;
}

/**
 * Analytics calendar props
 */
export interface AnalyticsCalendarProps {
    value: { start: string; end: string };
    onChange: (range: { start: string; end: string }) => void;
    onStartInputChange?: (value: string) => void;
    onEndInputChange?: (value: string) => void;
    startInput: string;
    endInput: string;
}
