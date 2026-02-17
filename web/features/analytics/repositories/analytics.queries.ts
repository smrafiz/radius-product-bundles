/**
 * Analytics Queries - Data Access Layer
 *
 * Analytics and metrics queries for tracking and reporting.
 */

import { format, startOfDay } from "date-fns";
import { prisma } from "@/shared/repositories/prisma-connect";
import { AnalyticsMetricsRepository } from "@/features/analytics";

/**
 * Track bundle view event
 */
export async function trackBundleView(
    bundleId: string,
    timestamp: Date | string = new Date(),
    customerId?: string,
    sessionId?: string,
) {
    const bundle = await prisma.bundle.findUnique({
        where: { id: bundleId },
        select: { status: true },
    });

    if (!bundle || bundle.status === "DELETED") {
        return;
    }

    const dateObj =
        typeof timestamp === "string" ? new Date(timestamp) : timestamp;

    const hour = dateObj.getHours();
    const date = startOfDay(dateObj);
    const dateKey = format(date, "yyyy-MM-dd");

    let isNewView = false;

    if (customerId) {
        // For logged-in users: Check if the customer already viewed this bundle today
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
            console.log(
                `[Analytics] New view tracked: bundle=${bundleId}, customer=${customerId}`,
            );
        } catch (error: any) {
            if (error.code === "P2002") {
                // Customer already viewed today
                console.log(
                    `[Analytics] Deduplicated view: bundle=${bundleId}, customer=${customerId}, date=${dateKey}`,
                );
                return;
            }
            throw error;
        }
    } else if (sessionId) {
        // For anonymous users: Check if the session already viewed this bundle today
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
            console.log(
                `[Analytics] New view tracked: bundle=${bundleId}, session=${sessionId}`,
            );
        } catch (error: any) {
            if (error.code === "P2002") {
                console.log(
                    `[Analytics] Deduplicated view: bundle=${bundleId}, session=${sessionId}, date=${dateKey}`,
                );
                return;
            }
            throw error;
        }
    } else {
        // No customer or session ID - count as anonymous view
        isNewView = true;
    }

    if (isNewView) {
        return prisma.bundleAnalytics.upsert({
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
    }
}

/**
 * Track add to cart event
 */
export async function trackAddToCart(
    bundleId: string,
    timestamp: Date = new Date(),
) {
    const bundle = await prisma.bundle.findUnique({
        where: { id: bundleId },
        select: { status: true },
    });

    if (!bundle || bundle.status === "DELETED") {
        return;
    }

    const dateObj =
        typeof timestamp === "string" ? new Date(timestamp) : timestamp;

    const hour = dateObj.getHours();
    const date = startOfDay(dateObj);

    return prisma.bundleAnalytics.upsert({
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
    const bundle = await prisma.bundle.findUnique({
        where: { id: params.bundleId },
        select: { status: true },
    });

    if (!bundle || bundle.status === "DELETED") {
        return;
    }

    const timestampObj = params.timestamp
        ? typeof params.timestamp === "string"
            ? new Date(params.timestamp)
            : params.timestamp
        : new Date();

    const hour = timestampObj.getHours();
    const date = startOfDay(timestampObj);

    return prisma.bundleAnalytics.upsert({
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
}

/**
 * Aggregate metrics for the dashboard
 *
 * Fetches current period, previous period, and totals in parallel.
 */
export async function aggregateBundleMetrics(
    shop: string,
    thirtyDaysAgo: Date,
    sixtyDaysAgo: Date,
): Promise<AnalyticsMetricsRepository> {
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

        // Total bundles count (exclude deleted)
        prisma.bundle.count({
            where: { shop, status: { not: "DELETED" as const } },
        }),

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
 * Aggregate bundle metrics by date range
 */
export async function aggregateBundleMetricsByRange(
    shop: string,
    currentStart: Date,
    currentEnd: Date,
    previousStart: Date,
    previousEnd: Date,
): Promise<AnalyticsMetricsRepository> {
    const [
        currentPeriod,
        previousPeriod,
        totalRevenueAllTime,
        totalBundles,
        activeBundles,
    ] = await Promise.all([
        // Current period (selected date range)
        prisma.bundleAnalytics.aggregate({
            where: {
                bundle: { shop },
                date: {
                    gte: currentStart,
                    lte: currentEnd,
                },
            },
            _sum: {
                bundleViews: true,
                bundlePurchases: true,
                bundleRevenue: true,
                bundleAddToCarts: true,
            },
        }),

        // Previous period (for comparison)
        prisma.bundleAnalytics.aggregate({
            where: {
                bundle: { shop },
                date: {
                    gte: previousStart,
                    lt: previousEnd,
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

        // Total bundles count (exclude deleted)
        prisma.bundle.count({
            where: { shop, status: { not: "DELETED" as const } },
        }),

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
 * Get analytics for a specific bundle
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

    return prisma.bundleAnalytics.findMany({
        where,
        orderBy: { date: "asc" },
    });
}

/**
 * Get an analytics summary for a specific bundle
 */
export async function getBundleAnalyticsSummary(
    bundleId: string,
    startDate: Date,
) {
    return prisma.bundleAnalytics.aggregate({
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
