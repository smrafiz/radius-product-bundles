"use server";

/**
 * Analytics Actions - Auth Layer
 *
 * Handles authentication and calls service layer.
 */

import {
    getAnalyticsMetrics,
    getBundleStats,
    getChartData,
    trackAnalyticsEvent,
    validateTrackingEvent,
} from "@/features/analytics/services";
import { ApiResponse } from "@/shared";
import { handleSessionToken } from "@/lib/shopify";
import { TrackingEvent } from "@/features/analytics";

/**
 * Get analytics metrics
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

        const metrics = await getAnalyticsMetrics(
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

        const stats = await getBundleStats(shop, days);

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
 * Get chart data
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

        const chartData = await getChartData(shop, days, startDate, endDate);

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
 * Track analytics event (for storefront via proxy)
 */
export async function trackAnalyticsEventAction(
    shop: string,
    event: any,
): Promise<ApiResponse> {
    try {
        // Validate event
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
