/**
 * Analytics component types
 */
import { Bundle } from "@/features/bundles";

/**
 * Analytics bundles list props
 */
export interface AnalyticsBasedBundlesListProps {
    bundles: Bundle[];
}

/**
 * Analytics based bundle configuration
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
