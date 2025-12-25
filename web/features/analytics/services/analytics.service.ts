/**
 * Analytics Service - Business Logic Layer
 */

import {
    aggregateBundleMetrics,
    getAnalyticsTrend,
    getBundlePerformanceStats,
    trackAddToCart,
    trackBundlePurchase,
    trackBundleView,
} from "@/features/analytics/repositories";
import { transformBundleMetrics } from "@/shared";
import { TrackingEvent } from "@/features/analytics";
import { eachDayOfInterval, endOfDay, startOfDay, subDays } from "date-fns";

/**
 * Get analytics metrics for the dashboard
 */
export async function getAnalyticsMetrics(
    shop: string,
    days: number = 30,
): Promise<any> {
    const now = new Date();
    const thirtyDaysAgo = startOfDay(subDays(now, days));
    const sixtyDaysAgo = startOfDay(subDays(now, days * 2));

    const rawMetrics = await aggregateBundleMetrics(
        shop,
        thirtyDaysAgo,
        sixtyDaysAgo,
    );

    // Transform using existing transformer
    return transformBundleMetrics(rawMetrics);
}

/**
 * Track analytics event (view, add-to-cart, purchase)
 */
export async function trackAnalyticsEvent(event: TrackingEvent) {
    switch (event.type) {
        case "bundle_view":
            return await trackBundleView(event.bundleId, event.timestamp);

        case "bundle_add_to_cart":
            return await trackAddToCart(event.bundleId, event.timestamp);

        case "bundle_purchase":
            return await trackBundlePurchase({
                bundleId: event.bundleId,
                revenue: event.revenue,
                customerId: event.customerId,
                isNewCustomer: event.isNewCustomer,
                timestamp: event.timestamp,
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
export async function getChartData(shop: string, days: number = 30) {
    const now = new Date();
    const startDate = startOfDay(subDays(now, days));
    const endDate = endOfDay(now);

    const analytics = await getAnalyticsTrend(shop, startDate, endDate);

    // Fill in missing days with zero values
    const dateRange = eachDayOfInterval({ start: startDate, end: endDate });

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
