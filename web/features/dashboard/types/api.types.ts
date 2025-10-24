/**
 * Dashboard API types
 */

import type { ApiResponse } from "@/shared";
import type { BundleListItem } from "@/features/bundles";
import { DashboardMetricsRaw } from "@/features/dashboard";

/**
 * Dashboard data API response
 */
export interface DashboardDataResponse {
    bundles: BundleListItem[];
    metrics: DashboardMetricsRaw;
    lastUpdated: string;
}

/**
 * Get dashboard data response
 */
export type GetDashboardDataResponse = ApiResponse<DashboardDataResponse>;

/**
 * Dashboard overviews API response
 */
export interface DashboardOverviewResponse {
    summary: DashboardSummary;
    recentBundles: BundleListItem[];
    topPerformingBundles: BundleListItem[];
    recentActivity: ActivityItem[];
}

/**
 * Dashboard summary data
 */
export interface DashboardSummary {
    totalRevenue: number;
    totalOrders: number;
    conversionRate: number;
    activeBundles: number;
    totalCustomers: number;
}

/**
 * Activity item
 */
export interface ActivityItem {
    id: string;
    type: "bundle_created" | "bundle_updated" | "sale" | "view";
    description: string;
    timestamp: string;
    metadata?: Record<string, any>;
}

/**
 * Dashboard refresh request
 */
export interface DashboardRefreshRequest {
    includeMetrics?: boolean;
    includeBundles?: boolean;
    includeActivity?: boolean;
}
