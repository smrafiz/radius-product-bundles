/**
 * Analytics Types
 */

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

/*
 * Top bundle stats
 */
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

/*
 * Bundle with analytics
 */
export interface BundleWithAnalytics {
    id: string;
    title: string;
    status: string;
    type: string;
    discountType: string;
    discountValue: number;
    createdAt: Date;
    publishedAt: Date | null;
    isPublished: boolean;
    revenue: number;
    views: number;
    addToCarts: number;
    purchases: number;
    conversionRate: number;
    addToCartRate: number;
    revenuePerView: number;
    averageOrderValue: number;
    healthStatus?: string;
    healthReason?: string;
}
