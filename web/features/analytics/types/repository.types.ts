/**
 * Analytics Types
 */

import { prisma } from "@/shared/repositories";

/**
 * Raw analytics metrics from the database
 */
export interface AnalyticsMetricsRepository {
    currentPeriod: {
        _sum: {
            bundleViews: number | null;
            bundlePurchases: number | null;
            bundleRevenue: number | null;
            bundleAddToCarts: number | null;
        };
    };
    previousPeriod: {
        _sum: {
            bundleViews: number | null;
            bundlePurchases: number | null;
            bundleRevenue: number | null;
        };
    };
    totalRevenueAllTime: {
        _sum: {
            bundleRevenue: number | null;
        };
    };
    totalBundles: number;
    activeBundles: number;
}

/**
 * Transformed analytics metrics for UI
 */
export interface TransformedAnalyticsMetrics {
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
 * Tracking event types
 */
export type TrackingEventType =
    | "bundle_view"
    | "bundle_add_to_cart"
    | "bundle_purchase";

/**
 * Base tracking event
 */
interface BaseTrackingEvent {
    bundleId: string;
    timestamp?: Date;
}

/**
 * Bundle view event
 */
export interface BundleViewEvent extends BaseTrackingEvent {
    type: "bundle_view";
}

/**
 * Add to cart event
 */
export interface AddToCartEvent extends BaseTrackingEvent {
    type: "bundle_add_to_cart";
}

/**
 * Purchase event
 */
export interface PurchaseEvent extends BaseTrackingEvent {
    type: "bundle_purchase";
    revenue: number;
    customerId?: string;
    isNewCustomer?: boolean;
}

/**
 * Bundle performance stats
 */
export interface BundlePerformanceStats {
    bundleId: string;
    bundleName: string;
    bundleStatus: string;
    bundleType?: string;
    views: number;
    addToCarts: number;
    purchases: number;
    revenue: number;
    conversionRate: number;
}

export interface TopBundleStats {
    bundleId: string;
    revenue: number;
    purchases: number;
    views: number;
    addToCarts: number;
    conversionRate: number;
    addToCartRate: number;
    revenuePerView: number;
}

export interface TopBundleDetails extends TopBundleStats {
    title: string;
    status: string;
    discountType: string | null;
    discountValue: number | null;
    createdAt: Date;
}

export interface TopBundleTrend {
    currentRevenue: number;
    previousRevenue: number;
    trendPercentage: number;
}
