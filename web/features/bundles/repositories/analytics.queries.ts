/**
 * Analytics Queries - Data Access Layer
 *
 * Analytics and metrics queries.
 */

import { prisma } from "@/shared";
import { AnalyticsMetrics } from "@/features/bundles";

/**
 * Aggregate metrics for the dashboard
 *
 * Fetches current period, previous period, and totals in parallel.
 */
export async function aggregateBundleMetrics(
    shop: string,
    thirtyDaysAgo: Date,
    sixtyDaysAgo: Date,
): Promise<AnalyticsMetrics> {
    const [
        currentPeriod,
        previousPeriod,
        totalRevenueAllTime,
        totalBundles,
        activeBundles,
    ] = await Promise.all([
        // Current period (last 30 days)
        prisma.bundleAnalytics.aggregate({
            where: {
                bundle: { shop },
                date: { gte: thirtyDaysAgo },
            },
            _sum: {
                bundleViews: true,
                bundlePurchases: true,
                bundleRevenue: true,
                bundleAddToCarts: true,
            },
        }),

        // Previous period (30-60 days ago)
        prisma.bundleAnalytics.aggregate({
            where: {
                bundle: { shop },
                date: {
                    gte: sixtyDaysAgo,
                    lt: thirtyDaysAgo,
                },
            },
            _sum: {
                bundleViews: true,
                bundlePurchases: true,
                bundleRevenue: true,
            },
        }),

        // All-time revenue
        prisma.bundleAnalytics.aggregate({
            where: {
                bundle: { shop },
            },
            _sum: { bundleRevenue: true },
        }),

        // Total bundles count
        prisma.bundle.count({ where: { shop } }),

        // Active bundles count
        prisma.bundle.count({ where: { shop, status: "ACTIVE" } }),
    ]);

    return {
        currentPeriod,
        previousPeriod,
        totalRevenueAllTime,
        totalBundles,
        activeBundles,
    };
}

/**
 * Get analytics for specific bundle
 */
export async function getBundleAnalytics(
    bundleId: string,
    startDate: Date,
    endDate?: Date,
) {
    const where: any = {
        bundleId,
        date: { gte: startDate },
    };

    if (endDate) {
        where.date.lte = endDate;
    }

    return await prisma.bundleAnalytics.findMany({
        where,
        orderBy: { date: "asc" },
    });
}

/**
 * Get analytics summary for specific bundle
 */
export async function getBundleAnalyticsSummary(
    bundleId: string,
    startDate: Date,
) {
    return await prisma.bundleAnalytics.aggregate({
        where: {
            bundleId,
            date: { gte: startDate },
        },
        _sum: {
            bundleViews: true,
            bundlePurchases: true,
            bundleRevenue: true,
            bundleAddToCarts: true,
        },
        _avg: {
            bundleRevenue: true,
        },
        _count: true,
    });
}

/**
 * Get top performing bundles by revenue
 */
export async function getTopBundlesByRevenue(
    shop: string,
    limit: number = 10,
    startDate?: Date,
) {
    const where: any = {
        bundle: { shop },
    };

    if (startDate) {
        where.date = { gte: startDate };
    }

    return await prisma.bundleAnalytics.groupBy({
        by: ["bundleId"],
        where,
        _sum: {
            bundleRevenue: true,
            bundlePurchases: true,
        },
        orderBy: {
            _sum: {
                bundleRevenue: "desc",
            },
        },
        take: limit,
    });
}

/**
 * Get analytics trend (daily aggregates)
 */
export async function getAnalyticsTrend(
    shop: string,
    startDate: Date,
    endDate: Date,
) {
    return await prisma.bundleAnalytics.groupBy({
        by: ["date"],
        where: {
            bundle: { shop },
            date: {
                gte: startDate,
                lte: endDate,
            },
        },
        _sum: {
            bundleViews: true,
            bundlePurchases: true,
            bundleRevenue: true,
            bundleAddToCarts: true,
        },
        orderBy: {
            date: "asc",
        },
    });
}
