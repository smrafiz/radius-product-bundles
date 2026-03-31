/**
 * Analytics Queries - Data Access Layer
 *
 * Analytics and metrics queries for tracking and reporting.
 */

import type {
    AnalyticsMetricsRepository,
    RawAnalyticsRow,
    RawBundleCountRow,
} from "@/features/analytics";
import { format, startOfDay } from "date-fns";
import { prisma } from "@/shared/repositories/prisma-connect";

/**
 * Track bundle view event
 */
export async function trackBundleView(
    bundleId: string,
    timestamp: Date | string = new Date(),
    customerId?: string,
    sessionId?: string,
) {
    const dateObj =
        typeof timestamp === "string" ? new Date(timestamp) : timestamp;

    const hour = dateObj.getHours();
    const date = startOfDay(dateObj);
    const dateKey = format(date, "yyyy-MM-dd");

    let isNewView = false;

    if (customerId) {
        try {
            await prisma.bundleView.create({
                data: {
                    bundleId,
                    customerId,
                    date: dateKey,
                    timestamp: dateObj,
                },
            });
            isNewView = true;
        } catch (error: any) {
            if (error.code === "P2002") return;
            if (error.code === "P2003") return;
            throw error;
        }
    } else if (sessionId) {
        try {
            await prisma.bundleView.create({
                data: {
                    bundleId,
                    sessionId,
                    date: dateKey,
                    timestamp: dateObj,
                },
            });
            isNewView = true;
        } catch (error: any) {
            if (error.code === "P2002") return;
            if (error.code === "P2003") return;
            throw error;
        }
    } else {
        isNewView = true;
    }

    if (isNewView) {
        try {
            return await prisma.bundleAnalytics.upsert({
                where: {
                    bundleId_date_hour: { bundleId, date, hour },
                },
                update: {
                    bundleViews: { increment: 1 },
                },
                create: {
                    bundleId,
                    date,
                    hour,
                    bundleViews: 1,
                    bundleAddToCarts: 0,
                    bundlePurchases: 0,
                    bundleRevenue: 0,
                },
            });
        } catch (error: any) {
            if (error.code === "P2003") return;
            throw error;
        }
    }
}

/**
 * Track add to cart event
 */
export async function trackAddToCart(
    bundleId: string,
    timestamp: Date = new Date(),
) {
    const dateObj =
        typeof timestamp === "string" ? new Date(timestamp) : timestamp;

    const hour = dateObj.getHours();
    const date = startOfDay(dateObj);

    try {
        return await prisma.bundleAnalytics.upsert({
            where: {
                bundleId_date_hour: { bundleId, date, hour },
            },
            update: {
                bundleAddToCarts: { increment: 1 },
            },
            create: {
                bundleId,
                date,
                hour,
                bundleViews: 0,
                bundleAddToCarts: 1,
                bundlePurchases: 0,
                bundleRevenue: 0,
            },
        });
    } catch (error: any) {
        if (error.code === "P2003") return;
        throw error;
    }
}

/**
 * Track purchase event (from webhook)
 */
export async function trackBundlePurchase(params: {
    bundleId: string;
    revenue: number;
    customerId?: string;
    isNewCustomer?: boolean;
    timestamp?: Date;
}) {
    const timestampObj = params.timestamp
        ? typeof params.timestamp === "string"
            ? new Date(params.timestamp)
            : params.timestamp
        : new Date();

    const hour = timestampObj.getHours();
    const date = startOfDay(timestampObj);

    try {
        return await prisma.bundleAnalytics.upsert({
            where: {
                bundleId_date_hour: {
                    bundleId: params.bundleId,
                    date,
                    hour,
                },
            },
            update: {
                bundlePurchases: { increment: 1 },
                bundleRevenue: { increment: params.revenue },
                newCustomerPurchases: params.isNewCustomer
                    ? { increment: 1 }
                    : undefined,
                returningCustomerPurchases: !params.isNewCustomer
                    ? { increment: 1 }
                    : undefined,
            },
            create: {
                bundleId: params.bundleId,
                date,
                hour,
                bundleViews: 0,
                bundleAddToCarts: 0,
                bundlePurchases: 1,
                bundleRevenue: params.revenue,
                newCustomerPurchases: params.isNewCustomer ? 1 : 0,
                returningCustomerPurchases: !params.isNewCustomer ? 1 : 0,
            },
        });
    } catch (error: any) {
        if (error.code === "P2003") return;
        throw error;
    }
}

/**
 * Aggregate metrics for the dashboard
 *
 * Uses raw SQL to combine 5 queries into 2 for fewer DB round-trips.
 */
export async function aggregateBundleMetrics(
    shop: string,
    thirtyDaysAgo: Date,
    sixtyDaysAgo: Date,
): Promise<AnalyticsMetricsRepository> {
    const [analyticsRows, countRows] = await Promise.all([
        // Single query: current period + previous period + all-time revenue
        prisma.$queryRaw<RawAnalyticsRow[]>`
            SELECT
                COALESCE(SUM(CASE WHEN ba.date >= ${thirtyDaysAgo} THEN ba."bundleViews" ELSE 0 END), 0) AS "currentViews",
                COALESCE(SUM(CASE WHEN ba.date >= ${thirtyDaysAgo} THEN ba."bundlePurchases" ELSE 0 END), 0) AS "currentPurchases",
                COALESCE(SUM(CASE WHEN ba.date >= ${thirtyDaysAgo} THEN ba."bundleRevenue" ELSE 0 END), 0) AS "currentRevenue",
                COALESCE(SUM(CASE WHEN ba.date >= ${thirtyDaysAgo} THEN ba."bundleAddToCarts" ELSE 0 END), 0) AS "currentAddToCarts",
                COALESCE(SUM(CASE WHEN ba.date >= ${sixtyDaysAgo} AND ba.date < ${thirtyDaysAgo} THEN ba."bundleViews" ELSE 0 END), 0) AS "prevViews",
                COALESCE(SUM(CASE WHEN ba.date >= ${sixtyDaysAgo} AND ba.date < ${thirtyDaysAgo} THEN ba."bundlePurchases" ELSE 0 END), 0) AS "prevPurchases",
                COALESCE(SUM(CASE WHEN ba.date >= ${sixtyDaysAgo} AND ba.date < ${thirtyDaysAgo} THEN ba."bundleRevenue" ELSE 0 END), 0) AS "prevRevenue",
                COALESCE(SUM(ba."bundleRevenue"), 0) AS "alltimeRevenue"
            FROM bundle_analytics ba
            JOIN bundles b ON ba."bundleId" = b.id
            WHERE b.shop = ${shop}
        `,
        // Single query: total + active bundle counts
        prisma.$queryRaw<RawBundleCountRow[]>`
            SELECT
                COUNT(*) FILTER (WHERE status != 'DELETED') AS "totalBundles",
                COUNT(*) FILTER (WHERE status = 'ACTIVE') AS "activeBundles"
            FROM bundles
            WHERE shop = ${shop}
        `,
    ]);

    const a = analyticsRows[0];
    const c = countRows[0];

    return {
        currentPeriod: {
            _sum: {
                bundleViews: Number(a.currentViews),
                bundlePurchases: Number(a.currentPurchases),
                bundleRevenue: Number(a.currentRevenue),
                bundleAddToCarts: Number(a.currentAddToCarts),
            },
        },
        previousPeriod: {
            _sum: {
                bundleViews: Number(a.prevViews),
                bundlePurchases: Number(a.prevPurchases),
                bundleRevenue: Number(a.prevRevenue),
            },
        },
        totalRevenueAllTime: {
            _sum: { bundleRevenue: Number(a.alltimeRevenue) },
        },
        totalBundles: Number(c.totalBundles),
        activeBundles: Number(c.activeBundles),
    };
}

/**
 * Aggregate bundle metrics by date range
 *
 * Uses raw SQL to combine 5 queries into 2 for fewer DB round-trips.
 */
export async function aggregateBundleMetricsByRange(
    shop: string,
    currentStart: Date,
    currentEnd: Date,
    previousStart: Date,
    previousEnd: Date,
): Promise<AnalyticsMetricsRepository> {
    const [analyticsRows, countRows] = await Promise.all([
        prisma.$queryRaw<RawAnalyticsRow[]>`
            SELECT
                COALESCE(SUM(CASE WHEN ba.date >= ${currentStart} AND ba.date <= ${currentEnd} THEN ba."bundleViews" ELSE 0 END), 0) AS "currentViews",
                COALESCE(SUM(CASE WHEN ba.date >= ${currentStart} AND ba.date <= ${currentEnd} THEN ba."bundlePurchases" ELSE 0 END), 0) AS "currentPurchases",
                COALESCE(SUM(CASE WHEN ba.date >= ${currentStart} AND ba.date <= ${currentEnd} THEN ba."bundleRevenue" ELSE 0 END), 0) AS "currentRevenue",
                COALESCE(SUM(CASE WHEN ba.date >= ${currentStart} AND ba.date <= ${currentEnd} THEN ba."bundleAddToCarts" ELSE 0 END), 0) AS "currentAddToCarts",
                COALESCE(SUM(CASE WHEN ba.date >= ${previousStart} AND ba.date < ${previousEnd} THEN ba."bundleViews" ELSE 0 END), 0) AS "prevViews",
                COALESCE(SUM(CASE WHEN ba.date >= ${previousStart} AND ba.date < ${previousEnd} THEN ba."bundlePurchases" ELSE 0 END), 0) AS "prevPurchases",
                COALESCE(SUM(CASE WHEN ba.date >= ${previousStart} AND ba.date < ${previousEnd} THEN ba."bundleRevenue" ELSE 0 END), 0) AS "prevRevenue",
                COALESCE(SUM(ba."bundleRevenue"), 0) AS "alltimeRevenue"
            FROM bundle_analytics ba
            JOIN bundles b ON ba."bundleId" = b.id
            WHERE b.shop = ${shop}
        `,
        prisma.$queryRaw<RawBundleCountRow[]>`
            SELECT
                COUNT(*) FILTER (WHERE status != 'DELETED') AS "totalBundles",
                COUNT(*) FILTER (WHERE status = 'ACTIVE') AS "activeBundles"
            FROM bundles
            WHERE shop = ${shop}
        `,
    ]);

    const a = analyticsRows[0];
    const c = countRows[0];

    return {
        currentPeriod: {
            _sum: {
                bundleViews: Number(a.currentViews),
                bundlePurchases: Number(a.currentPurchases),
                bundleRevenue: Number(a.currentRevenue),
                bundleAddToCarts: Number(a.currentAddToCarts),
            },
        },
        previousPeriod: {
            _sum: {
                bundleViews: Number(a.prevViews),
                bundlePurchases: Number(a.prevPurchases),
                bundleRevenue: Number(a.prevRevenue),
            },
        },
        totalRevenueAllTime: {
            _sum: { bundleRevenue: Number(a.alltimeRevenue) },
        },
        totalBundles: Number(c.totalBundles),
        activeBundles: Number(c.activeBundles),
    };
}

/**
 * Get top-performing bundles by revenue
 */
export async function getTopBundlesByRevenue(
    shop: string,
    limit: number = 10,
    startDate?: Date,
) {
    const where: any = {
        bundle: { shop, status: { not: "DELETED" } },
    };

    if (startDate) {
        where.date = { gte: startDate };
    }

    return prisma.bundleAnalytics.groupBy({
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
    return prisma.bundleAnalytics.groupBy({
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

/**
 * Get bundle performance stats with details
 */
export async function getBundlePerformanceStats(
    shop: string,
    startDate: Date,
    limit: number = 50,
) {
    const stats = await prisma.bundleAnalytics.groupBy({
        by: ["bundleId"],
        where: {
            bundle: { shop },
            date: { gte: startDate },
        },
        _sum: {
            bundleViews: true,
            bundlePurchases: true,
            bundleRevenue: true,
            bundleAddToCarts: true,
        },
        orderBy: {
            _sum: {
                bundleRevenue: "desc",
            },
        },
        take: limit,
    });

    // Get bundle details
    const bundleIds = stats.map((s) => s.bundleId);
    const bundles = await prisma.bundle.findMany({
        where: {
            id: { in: bundleIds },
        },
        select: {
            id: true,
            name: true,
            status: true,
            type: true,
        },
    });

    // Merge stats with bundle details
    return stats.map((stat) => {
        const bundle = bundles.find((b) => b.id === stat.bundleId);
        const views = stat._sum.bundleViews || 0;
        const purchases = stat._sum.bundlePurchases || 0;
        const conversionRate = views > 0 ? (purchases / views) * 100 : 0;

        return {
            bundleId: stat.bundleId,
            bundleName: bundle?.name || "Unknown Bundle",
            bundleStatus: bundle?.status || "DRAFT",
            bundleType: bundle?.type,
            views,
            addToCarts: stat._sum.bundleAddToCarts || 0,
            purchases,
            revenue: stat._sum.bundleRevenue || 0,
            conversionRate: Math.round(conversionRate * 100) / 100,
        };
    });
}
