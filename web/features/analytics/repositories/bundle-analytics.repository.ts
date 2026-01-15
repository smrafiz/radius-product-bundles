/**
 * Bundle Analytics Repository - Data Access Layer
 *
 * Handles all database queries for top performing bundles analytics
 */
import { prisma } from "@/shared/repositories";
import { BundleWithAnalytics, calculateHealthStatus, TopBundleStats, TopBundleTrend, } from "@/features/analytics";

/**
 * Get top performing bundles with comprehensive metrics
 */
export async function getTopPerformingBundles(
    shop: string,
    startDate: Date,
    endDate: Date,
    limit: number = 10,
): Promise<TopBundleStats[]> {
    // Aggregate analytics by bundle
    const bundleStats = await prisma.bundleAnalytics.groupBy({
        by: ["bundleId"],
        where: {
            bundle: { shop },
            date: { gte: startDate, lte: endDate },
        },
        _sum: {
            bundleRevenue: true,
            bundlePurchases: true,
            bundleViews: true,
            bundleAddToCarts: true,
        },
        having: {
            bundleViews: { _sum: { gte: 10 } }, // Min 10 views
            bundlePurchases: { _sum: { gte: 1 } }, // Min 1 purchase
        },
        orderBy: {
            _sum: { bundleRevenue: "desc" }, // Sort by revenue
        },
        take: limit,
    });

    // Calculate derived metrics
    return bundleStats.map((stat) => {
        const views = stat._sum.bundleViews || 0;
        const purchases = stat._sum.bundlePurchases || 0;
        const revenue = stat._sum.bundleRevenue || 0;
        const addToCarts = stat._sum.bundleAddToCarts || 0;

        // Calculate rates
        const conversionRate = views > 0 ? (purchases / views) * 100 : 0;
        const addToCartRate = views > 0 ? (addToCarts / views) * 100 : 0;
        const revenuePerView = views > 0 ? revenue / views : 0;

        return {
            bundleId: stat.bundleId,
            revenue,
            purchases,
            views,
            addToCarts,
            conversionRate: Number(conversionRate.toFixed(2)),
            addToCartRate: Number(addToCartRate.toFixed(2)),
            revenuePerView: Number(revenuePerView.toFixed(2)),
        };
    });
}

/**
 * Get bundle details for top performers
 */
export async function getBundleDetails(bundleIds: string[]) {
    return prisma.bundle.findMany({
        where: { id: { in: bundleIds } },
        select: {
            id: true,
            name: true,
            status: true,
            discountType: true,
            discountValue: true,
            createdAt: true,
        },
    });
}

/**
 * Get bundle trend data (compare with the previous period)
 */
export async function getBundleTrend(
    shop: string,
    bundleId: string,
    currentStart: Date,
    currentEnd: Date,
    previousStart: Date,
    previousEnd: Date,
): Promise<TopBundleTrend> {
    // Get current period revenue
    const currentResult = await prisma.bundleAnalytics.aggregate({
        where: {
            bundleId,
            bundle: { shop },
            date: { gte: currentStart, lte: currentEnd },
        },
        _sum: {
            bundleRevenue: true,
        },
    });

    // Get previous period revenue
    const previousResult = await prisma.bundleAnalytics.aggregate({
        where: {
            bundleId,
            bundle: { shop },
            date: { gte: previousStart, lt: previousEnd },
        },
        _sum: {
            bundleRevenue: true,
        },
    });

    const currentRevenue = currentResult._sum.bundleRevenue || 0;
    const previousRevenue = previousResult._sum.bundleRevenue || 0;

    // Calculate trend percentage
    let trendPercentage = 0;
    if (previousRevenue > 0) {
        trendPercentage =
            ((currentRevenue - previousRevenue) / previousRevenue) * 100;
    } else if (currentRevenue > 0) {
        trendPercentage = 100; // If no previous revenue, it's 100% growth
    }

    return {
        currentRevenue,
        previousRevenue,
        trendPercentage: Number(trendPercentage.toFixed(2)),
    };
}

/**
 * Get all bundles with their analytics aggregated for date range
 */
export async function getAllBundlesWithAnalytics(
    shop: string,
    startDate: Date,
    endDate: Date,
    sortBy:
        | "revenue"
        | "views"
        | "purchases"
        | "conversion"
        | "created" = "revenue",
    sortOrder: "asc" | "desc" = "desc",
): Promise<BundleWithAnalytics[]> {
    // Parallel Execution
    const [bundles, bundleAnalytics] = await Promise.all([
        prisma.bundle.findMany({
            where: { shop, deletedAt: null },
            select: {
                id: true,
                name: true,
                status: true,
                type: true,
                discountType: true,
                discountValue: true,
                createdAt: true,
                publishedAt: true,
                isPublished: true,
            },
        }),
        prisma.bundleAnalytics.groupBy({
            by: ["bundleId"],
            where: {
                bundle: { shop },
                date: { gte: startDate, lte: endDate },
            },
            _sum: {
                bundleRevenue: true,
                bundleViews: true,
                bundleAddToCarts: true,
                bundlePurchases: true,
            },
        }),
    ]);

    // Hash Map Lookup
    const analyticsMap = new Map(bundleAnalytics.map((a) => [a.bundleId, a]));

    // Single-Pass Transformation
    const bundlesWithAnalytics = bundles.map((bundle) => {
        const analytics = analyticsMap.get(bundle.id);

        const views = analytics?._sum.bundleViews || 0;
        const purchases = analytics?._sum.bundlePurchases || 0;
        const revenue = analytics?._sum.bundleRevenue || 0;
        const addToCarts = analytics?._sum.bundleAddToCarts || 0;

        const conversionRate = views > 0 ? (purchases / views) * 100 : 0;
        const addToCartRate = views > 0 ? (addToCarts / views) * 100 : 0;
        const revenuePerView = views > 0 ? revenue / views : 0;
        const averageOrderValue = purchases > 0 ? revenue / purchases : 0;

        // Health logic
        const health = calculateHealthStatus({
            views,
            conversionRate,
            revenue,
            addToCartRate,
        });

        return {
            id: bundle.id,
            title: bundle.name,
            status: bundle.status,
            type: bundle.type,
            discountType: bundle.discountType,
            discountValue: bundle.discountValue,
            createdAt: bundle.createdAt,
            publishedAt: bundle.publishedAt,
            isPublished: bundle.isPublished,
            revenue,
            views,
            addToCarts,
            purchases,
            conversionRate: Number(conversionRate.toFixed(2)),
            addToCartRate: Number(addToCartRate.toFixed(2)),
            revenuePerView: Number(revenuePerView.toFixed(2)),
            averageOrderValue: Number(averageOrderValue.toFixed(2)),
            healthStatus: health.status,
            healthReason: health.reason,
        };
    });

    // Mathematical Sorting
    return bundlesWithAnalytics.sort((a, b) => {
        const multiplier = sortOrder === "desc" ? -1 : 1;

        switch (sortBy) {
            case "revenue":
                return (a.revenue - b.revenue) * multiplier;
            case "views":
                return (a.views - b.views) * multiplier;
            case "purchases":
                return (a.purchases - b.purchases) * multiplier;
            case "conversion":
                return (a.conversionRate - b.conversionRate) * multiplier;
            case "created":
                return (
                    (a.createdAt.getTime() - b.createdAt.getTime()) * multiplier
                );
            default:
                return 0;
        }
    });
}

/**
 * Get bundle count by status
 */
export async function getBundleStatusCounts(shop: string) {
    const counts = await prisma.bundle.groupBy({
        by: ["status"],
        where: {
            shop,
            deletedAt: null,
        },
        _count: {
            id: true,
        },
    });

    return counts.reduce(
        (acc, curr) => {
            acc[curr.status] = curr._count.id;
            return acc;
        },
        {} as Record<string, number>,
    );
}
