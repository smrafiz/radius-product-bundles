"use server";

/**
 * Analytics Actions - Auth Layer
 *
 * Handles authentication and delegates to cached service layer.
 * Caching via `use cache` directive in analytics.cached.ts.
 */

import {
    trackAnalyticsEvent,
    validateTrackingEvent,
} from "@/features/analytics/services";
import { ApiResponse } from "@/shared";
import { handleSessionToken } from "@/lib/shopify";
import { TrackingEvent } from "@/features/analytics";
import {
    getCachedAnalyticsMetrics,
    getCachedBundleStats,
    getCachedChartData,
} from "@/features/analytics/services/analytics.cached";

/**
 * Get analytics metrics (cached via use cache: 5 min)
 */
export async function getAnalyticsMetricsAction(
    sessionToken: string,
    days: number = 30,
    startDate?: string,
    endDate?: string,
): Promise<ApiResponse> {
    try {
        const {
            session: { shop },
        } = await handleSessionToken(sessionToken);

        const metrics = await getCachedAnalyticsMetrics(
            shop,
            days,
            startDate,
            endDate,
        );

        return {
            status: "success",
            data: metrics,
        };
    } catch (error) {
        console.error("[getAnalyticsMetrics] Error:", error);

        return {
            status: "error",
            message:
                error instanceof Error
                    ? error.message
                    : "Failed to fetch analytics",
            data: null,
        };
    }
}

/**
 * Get bundle performance stats
 */
export async function getBundleStatsAction(
    sessionToken: string,
    days: number = 30,
): Promise<ApiResponse> {
    try {
        const {
            session: { shop },
        } = await handleSessionToken(sessionToken);

        const stats = await getCachedBundleStats(shop, days);

        return {
            status: "success",
            data: stats,
        };
    } catch (error) {
        console.error("[getBundleStats] Error:", error);

        return {
            status: "error",
            message:
                error instanceof Error
                    ? error.message
                    : "Failed to fetch bundle stats",
            data: null,
        };
    }
}

/**
 * Get chart data (cached via use cache: 5 min)
 */
export async function getChartDataAction(
    sessionToken: string,
    days: number = 30,
    startDate?: string,
    endDate?: string,
): Promise<ApiResponse> {
    try {
        const {
            session: { shop },
        } = await handleSessionToken(sessionToken);

        const chartData = await getCachedChartData(
            shop,
            days,
            startDate,
            endDate,
        );

        return {
            status: "success",
            data: chartData,
        };
    } catch (error) {
        console.error("[getChartData] Error:", error);

        return {
            status: "error",
            message:
                error instanceof Error
                    ? error.message
                    : "Failed to fetch chart data",
            data: null,
        };
    }
}

/**
 * Track analytics event (for storefront via proxy — NOT cached)
 */
export async function trackAnalyticsEventAction(
    shop: string,
    event: any,
): Promise<ApiResponse> {
    try {
        if (!validateTrackingEvent(event)) {
            return {
                status: "error",
                message: "Invalid tracking event data",
                data: null,
            };
        }

        await trackAnalyticsEvent(event as TrackingEvent);

        return {
            status: "success",
            data: { tracked: true },
        };
    } catch (error) {
        console.error("[trackAnalyticsEvent] Error:", error);

        return {
            status: "error",
            message: "Failed to track event",
            data: null,
        };
    }
}
