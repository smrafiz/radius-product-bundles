import { BundleWithAnalytics, TopBundleDetails } from "@/features/analytics";

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

/**
 * Sort field for bundle analytics
 */
export type SortField =
    | "revenue"
    | "views"
    | "purchases"
    | "conversion"
    | "created"
    | "name"
    | "status"
    | "type";

/**
 * Sort order for bundle analytics
 */
export type SortOrder = "asc" | "desc";

/**
 * Response for all bundles with analytics
 */
export interface AllBundlesResponse {
    bundles: BundleWithAnalytics[];
    statusCounts: Record<string, number>;
    totalBundles: number;
}

/**
 * Parameters for paginated bundles service
 */
export interface PaginatedBundlesServiceParams {
    shop: string;
    startDateStr: string;
    endDateStr: string;
    sortBy?: SortField;
    sortOrder?: SortOrder;
    page?: number;
    perPage?: number;
    search?: string;
}

/**
 * Pagination metadata
 */
export interface PaginationMeta {
    page: number;
    perPage: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
}

/**
 * Response for paginated bundles with analytics
 */
export interface PaginatedAllBundlesResponse {
    bundles: BundleWithAnalytics[];
    pagination: PaginationMeta;
    statusCounts: Record<string, number>;
    totalBundles: number;
}

/**
 * Data type for paginated bundles hook
 */
export type PaginatedAllBundlesData = PaginatedAllBundlesResponse;
