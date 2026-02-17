/**
 * Bundle Analytics Repository - Data Access Layer
 *
 * Handles all database queries for top performing bundles analytics
 */
import {
    BundleWithAnalytics,
    calculateHealthStatus,
    CoreBundleFetchParams,
    CoreBundleFetchResult,
    PaginatedBundleParams,
    PaginatedBundleResult,
    TopBundleStats,
    TopBundleTrend,
} from "@/features/analytics";
import { prisma } from "@/shared/repositories";
import { stripDeletedSuffix } from "@/features/bundles";

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
            bundle: { shop, status: { not: "DELETED" as const } },
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
            type: true,
            status: true,
            discountType: true,
            discountValue: true,
            createdAt: true,
            images: true,
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
    const result = await fetchBundlesWithAnalyticsCore({
        shop,
        startDate,
        endDate,
        sortBy,
        sortOrder,
    });

    return result.bundles;
}

/**
 * Get paginated bundles with analytics, search, and sorting
 */
export async function getPaginatedBundlesWithAnalytics(
    params: PaginatedBundleParams,
): Promise<PaginatedBundleResult> {
    const {
        shop,
        startDate,
        endDate,
        sortBy = "revenue",
        sortOrder = "desc",
        page = 1,
        perPage = 10,
        search = "",
    } = params;

    // Fetch all matching bundles with analytics
    const { bundles, totalCount } = await fetchBundlesWithAnalyticsCore({
        shop,
        startDate,
        endDate,
        sortBy,
        sortOrder,
        search,
    });

    // Apply pagination
    const startIndex = (page - 1) * perPage;
    const paginatedBundles = bundles.slice(startIndex, startIndex + perPage);

    // Calculate pagination metadata
    const totalPages = Math.ceil(totalCount / perPage);

    return {
        bundles: paginatedBundles,
        pagination: {
            page,
            perPage,
            total: totalCount,
            totalPages,
            hasNextPage: page < totalPages,
            hasPrevPage: page > 1,
        },
    };
}

/**
 * Get bundle count by status
 */
export async function getBundleStatusCounts(shop: string) {
    const counts = await prisma.bundle.groupBy({
        by: ["status"],
        where: {
            shop,
            status: { not: "DELETED" as const },
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

/**
 * Core function to fetch and transform bundles with analytics
 */
export async function fetchBundlesWithAnalyticsCore(
    params: CoreBundleFetchParams,
): Promise<CoreBundleFetchResult> {
    const { shop, startDate, endDate, sortBy, sortOrder, search = "" } = params;

    // Build the where clause for bundles
    const bundleWhereClause: any = {
        shop,
    };

    // Add search filter if provided
    if (search && search.trim() !== "") {
        bundleWhereClause.name = {
            contains: search.trim(),
            mode: "insensitive",
        };
    }

    // Parallel Execution: Get bundles, analytics, and count
    const [bundles, bundleAnalytics, totalCount] = await Promise.all([
        prisma.bundle.findMany({
            where: bundleWhereClause,
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
        prisma.bundle.count({
            where: bundleWhereClause,
        }),
    ]);

    // Hash Map Lookup for analytics
    const analyticsMap = new Map(bundleAnalytics.map((a) => [a.bundleId, a]));

    // Transform bundles with analytics
    const bundlesWithAnalytics = bundles.map((bundle) =>
        transformBundleWithAnalytics(bundle, analyticsMap),
    );

    // Sort bundles
    const sortedBundles = sortBundles(bundlesWithAnalytics, sortBy, sortOrder);

    return {
        bundles: sortedBundles,
        totalCount,
    };
}

/**
 * Transform a bundle record with its analytics data
 */
export function transformBundleWithAnalytics(
    bundle: any,
    analyticsMap: Map<string, any>,
): BundleWithAnalytics {
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
        title: stripDeletedSuffix(bundle.name),
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
}

/**
 * Sort bundles by the specified field and order
 */
export function sortBundles(
    bundles: BundleWithAnalytics[],
    sortBy: "revenue" | "views" | "purchases" | "conversion" | "created",
    sortOrder: "asc" | "desc",
): BundleWithAnalytics[] {
    const multiplier = sortOrder === "desc" ? -1 : 1;

    return [...bundles].sort((a, b) => {
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
