/**
 * Analytics Service - Business Logic Layer
 */

import {
    aggregateBundleMetrics,
    aggregateBundleMetricsByRange,
    getAnalyticsTrend,
    getBundlePerformanceStats,
    trackAddToCart,
    trackBundlePurchase,
    trackBundleView,
} from "@/features/analytics/repositories";
import { transformBundleMetrics } from "@/shared";
import {
    endOfDayUTC,
    parseDateAsUTC,
    TrackingEvent,
} from "@/features/analytics";
import { endOfDay, startOfDay, subDays } from "date-fns";

/**
 * Get analytics metrics for the dashboard
 */
export async function getAnalyticsMetrics(
    shop: string,
    days: number = 30,
    startDateStr?: string,
    endDateStr?: string,
): Promise<any> {
    let rawMetrics;

    if (startDateStr && endDateStr) {
        const currentPeriodStart = parseDateAsUTC(startDateStr);
        const currentPeriodEnd = endOfDayUTC(endDateStr);

        // Calculate previous period (same duration before current period)
        const daysDifference = Math.ceil(
            (currentPeriodEnd.getTime() - currentPeriodStart.getTime()) /
                (1000 * 60 * 60 * 24),
        );

        const previousPeriodStart = new Date(currentPeriodStart);
        previousPeriodStart.setUTCDate(
            previousPeriodStart.getUTCDate() - daysDifference,
        );

        rawMetrics = await aggregateBundleMetricsByRange(
            shop,
            currentPeriodStart,
            currentPeriodEnd,
            previousPeriodStart,
            currentPeriodStart,
        );
    } else {
        // Use days approach
        const now = new Date();
        const currentPeriodStart = startOfDay(subDays(now, days));
        const previousPeriodStart = startOfDay(subDays(now, days * 2));

        rawMetrics = await aggregateBundleMetrics(
            shop,
            currentPeriodStart,
            previousPeriodStart,
        );
    }

    return transformBundleMetrics(rawMetrics);
}

/**
 * Track analytics event (view, add-to-cart, purchase)
 */
export async function trackAnalyticsEvent(event: TrackingEvent) {
    const timestamp =
        typeof event.timestamp === "string"
            ? new Date(event.timestamp)
            : event.timestamp;

    console.log("trackAnalyticsEvent", event);

    switch (event.type) {
        case "bundle_view":
            return await trackBundleView(
                event.bundleId,
                timestamp,
                event.customerId,
                event.sessionId,
            );

        case "bundle_add_to_cart":
            return await trackAddToCart(event.bundleId, timestamp);

        case "bundle_purchase":
            return await trackBundlePurchase({
                bundleId: event.bundleId,
                revenue: event.revenue ?? 0,
                customerId: event.customerId,
                isNewCustomer: event.isNewCustomer,
                timestamp: timestamp,
            });

        default:
            throw new Error(`Unknown event type: ${(event as any).type}`);
    }
}

/**
 * Get bundle performance stats
 */
export async function getBundleStats(shop: string, days: number = 30) {
    const startDate = startOfDay(subDays(new Date(), days));

    return await getBundlePerformanceStats(shop, startDate, 50);
}

/**
 * Get chart data for the analytics dashboard
 */
export async function getChartData(
    shop: string,
    days: number = 30,
    startDateStr?: string,
    endDateStr?: string,
) {
    // Determine date range
    let startDate: Date;
    let endDate: Date;

    if (startDateStr && endDateStr) {
        startDate = parseDateAsUTC(startDateStr);
        endDate = endOfDayUTC(endDateStr);
    } else {
        startDate = startOfDay(subDays(new Date(), days));
        endDate = endOfDay(new Date());
    }

    // Fetch analytics data
    const analytics = await getAnalyticsTrend(shop, startDate, endDate);

    const dateRange: Date[] = [];
    const current = new Date(startDate);

    while (current <= endDate) {
        dateRange.push(new Date(current));
        current.setUTCDate(current.getUTCDate() + 1);
    }

    // Map to chart data
    return dateRange.map((date) => {
        const dateStr = date.toISOString().split("T")[0];
        const data = analytics.find(
            (a) => a.date.toISOString().split("T")[0] === dateStr,
        );

        return {
            date: dateStr,
            views: data?._sum.bundleViews || 0,
            addToCarts: data?._sum.bundleAddToCarts || 0,
            purchases: data?._sum.bundlePurchases || 0,
            revenue: data?._sum.bundleRevenue || 0,
        };
    });
}

/**
 * Validate tracking event data
 */
export function validateTrackingEvent(event: any): event is TrackingEvent {
    if (!event.bundleId || typeof event.bundleId !== "string") {
        return false;
    }

    if (!event.type || typeof event.type !== "string") {
        return false;
    }

    const validTypes = ["bundle_view", "bundle_add_to_cart", "bundle_purchase"];
    if (!validTypes.includes(event.type)) {
        return false;
    }

    if (event.type === "bundle_purchase") {
        if (typeof event.revenue !== "number" || event.revenue < 0) {
            return false;
        }
    }

    return true;
}
