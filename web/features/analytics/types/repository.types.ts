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
    type: string;
    status: string;
    discountType: string | null;
    discountValue: number | null;
    createdAt: Date;
    images: string[];
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

/**
 * Parameters for paginated bundle analytics query
 */
export interface PaginatedBundleParams {
    shop: string;
    startDate: Date;
    endDate: Date;
    sortBy?:
        | "revenue"
        | "views"
        | "purchases"
        | "conversion"
        | "created"
        | "name"
        | "status"
        | "type";
    sortOrder?: "asc" | "desc";
    page?: number;
    perPage?: number;
    search?: string;
}

/**
 * Result of paginated bundle analytics query
 */
export interface PaginatedBundleResult {
    bundles: BundleWithAnalytics[];
    pagination: {
        page: number;
        perPage: number;
        total: number;
        totalPages: number;
        hasNextPage: boolean;
        hasPrevPage: boolean;
    };
}

/**
 * Internal parameters for the core bundle fetching function
 */
export interface CoreBundleFetchParams {
    shop: string;
    startDate: Date;
    endDate: Date;
    sortBy:
        | "revenue"
        | "views"
        | "purchases"
        | "conversion"
        | "created"
        | "name"
        | "status"
        | "type";
    sortOrder: "asc" | "desc";
    search?: string;
    page?: number;
    perPage?: number;
}

/**
 * Internal result from core bundle fetching function
 */
export interface CoreBundleFetchResult {
    bundles: BundleWithAnalytics[];
    totalCount: number;
}
