import { TopBundleDetails } from "@/features/analytics";

/**
 * bundle details with trend analysis and performance indicators.
 */
export interface TopBundleWithTrend extends TopBundleDetails {
    trendPercentage: number;
    badges: BundleBadge[];
}

/**
 * Represents a visual badge.
 */
export interface BundleBadge {
    icon: string;
    label: string;
    tone: "success" | "info" | "attention" | "critical";
    tooltip: string;
}

/**
 * Union of all tracking events
 */
export interface TrackingEvent {
    type: "bundle_view" | "bundle_add_to_cart" | "bundle_purchase";
    bundleId: string;
    productId?: string;
    customerId?: string;
    sessionId?: string;
    revenue?: number;
    isNewCustomer?: boolean;
    timestamp?: Date | string;
}
