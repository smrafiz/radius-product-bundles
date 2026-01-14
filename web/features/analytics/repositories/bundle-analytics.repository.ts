/**
 * Bundle Analytics Repository - Data Access Layer
 *
 * Handles all database queries for top performing bundles analytics
 */
import { prisma } from "@/shared/repositories";
import { TopBundleStats, TopBundleTrend } from "@/features/analytics";

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
