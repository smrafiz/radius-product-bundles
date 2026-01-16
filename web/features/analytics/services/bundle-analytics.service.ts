/**
 * Bundle Analytics Service - Business Logic Layer
 *
 * Combines repository data with business rules and enhancements
 */

import {
    AllBundlesResponse,
    BundleBadge,
    BundleWithAnalytics,
    endOfDayUTC,
    PaginatedAllBundlesResponse,
    PaginatedBundlesServiceParams,
    parseDateAsUTC,
    SortField,
    SortOrder,
    TopBundleWithTrend,
} from "@/features/analytics";
import {
    getAllBundlesWithAnalytics,
    getBundleDetails,
    getBundleStatusCounts,
    getBundleTrend,
    getPaginatedBundlesWithAnalytics,
    getTopPerformingBundles,
} from "@/features/analytics/repositories";
import { formatCurrencyCompact } from "@/shared";

/**
 * Get top performing bundles with all enhancements
 */
export async function getTopBundlesService(
    shop: string,
    startDateStr: string,
    endDateStr: string,
    limit: number = 10,
): Promise<TopBundleWithTrend[]> {
    const currentStart = parseDateAsUTC(startDateStr);
    const currentEnd = endOfDayUTC(endDateStr);

    // Calculate previous period (same duration)
    const daysDifference = Math.ceil(
        (currentEnd.getTime() - currentStart.getTime()) / (1000 * 60 * 60 * 24),
    );

    const previousStart = new Date(currentStart);
    previousStart.setUTCDate(previousStart.getUTCDate() - daysDifference);
    const previousEnd = currentStart;

    // Get top bundles
    const bundleStats = await getTopPerformingBundles(
        shop,
        currentStart,
        currentEnd,
        limit,
    );

    if (bundleStats.length === 0) {
        return [];
    }

    // Get bundle details
    const bundleIds = bundleStats.map((b) => b.bundleId);
    const bundleDetails = await getBundleDetails(bundleIds);

    // Get trend data for each bundle
    const bundlesWithTrends = await Promise.all(
        bundleStats.map(async (stats) => {
            const details = bundleDetails.find((b) => b.id === stats.bundleId);

            if (!details) {
                return null;
            }

            // Get trend
            const trend = await getBundleTrend(
                shop,
                stats.bundleId,
                currentStart,
                currentEnd,
                previousStart,
                previousEnd,
            );

            // Generate badges
            const badges = generateBundleBadges(stats, trend);

            return {
                bundleId: stats.bundleId,
                title: details.name,
                status: details.status,
                discountType: details.discountType,
                discountValue: details.discountValue,
                createdAt: details.createdAt,
                revenue: stats.revenue,
                purchases: stats.purchases,
                views: stats.views,
                addToCarts: stats.addToCarts,
                conversionRate: stats.conversionRate,
                addToCartRate: stats.addToCartRate,
                revenuePerView: stats.revenuePerView,
                trendPercentage: trend.trendPercentage,
                badges,
            };
        }),
    );

    return bundlesWithTrends.filter((b) => b !== null) as TopBundleWithTrend[];
}

/**
 * Generate performance badges for a bundle
 */
export function generateBundleBadges(stats: any, trend: any): BundleBadge[] {
    const badges: BundleBadge[] = [];

    // High Converter Badge
    if (stats.conversionRate >= 15) {
        badges.push({
            icon: "🔥",
            label: "High Converter",
            tone: "success",
            tooltip: `Exceptional ${stats.conversionRate}% conversion rate. This bundle is highly effective at turning views into sales.`,
        });
    }

    // Revenue Star Badge
    if (stats.revenue >= 5000) {
        badges.push({
            icon: "💰",
            label: "Revenue Star",
            tone: "success",
            tooltip: `Top revenue performer with ${formatCurrencyCompact(stats.revenue)} earned. A major contributor to your store's income.`,
        });
    }

    // Hidden Gem Badge (low views, high conversion)
    if (stats.views < 100 && stats.conversionRate >= 10) {
        badges.push({
            icon: "💎",
            label: "Hidden Gem",
            tone: "info",
            tooltip: `Strong ${stats.conversionRate}% conversion with only ${stats.views} views. Consider promoting this bundle more for greater impact.`,
        });
    }

    // Trending Up Badge
    if (trend.trendPercentage >= 25) {
        badges.push({
            icon: "📈",
            label: "Trending",
            tone: "success",
            tooltip: `Growing fast with ${trend.trendPercentage.toFixed(0)}% revenue increase vs previous period. Momentum is building!`,
        });
    }

    // Needs Attention Badge (declining)
    if (trend.trendPercentage <= -25) {
        badges.push({
            icon: "⚠️",
            label: "Declining",
            tone: "attention",
            tooltip: `Revenue decreased ${Math.abs(trend.trendPercentage).toFixed(0)}% vs previous period. Review pricing, promotion, or bundle composition.`,
        });
    }

    // Strong Add-to-Cart Badge
    if (stats.addToCartRate >= 30) {
        badges.push({
            icon: "🛒",
            label: "High Interest",
            tone: "info",
            tooltip: `Strong ${stats.addToCartRate.toFixed(0)}% add-to-cart rate shows high customer interest. Focus on improving checkout conversion.`,
        });
    }

    return badges;
}

/**
 * Get all bundles with analytics
 */
export async function getAllBundlesAnalytics(
    shop: string,
    startDateStr: string,
    endDateStr: string,
    sortBy: SortField = "revenue",
    sortOrder: SortOrder = "desc",
): Promise<AllBundlesResponse> {
    const startDate = parseDateAsUTC(startDateStr);
    const endDate = endOfDayUTC(endDateStr);

    const [bundles, statusCounts] = await Promise.all([
        getAllBundlesWithAnalytics(shop, startDate, endDate, sortBy, sortOrder),
        getBundleStatusCounts(shop),
    ]);

    const totalBundles = Object.values(statusCounts).reduce((a, b) => a + b, 0);

    return {
        bundles,
        statusCounts,
        totalBundles,
    };
}

export async function getPaginatedBundlesAnalytics(
    params: PaginatedBundlesServiceParams,
): Promise<PaginatedAllBundlesResponse> {
    const {
        shop,
        startDateStr,
        endDateStr,
        sortBy = "revenue",
        sortOrder = "desc",
        page = 1,
        perPage = 10,
        search = "",
    } = params;

    const startDate = parseDateAsUTC(startDateStr);
    const endDate = endOfDayUTC(endDateStr);

    // Map SortField to repository sort field
    const repoSortBy = mapSortFieldToRepo(sortBy);

    const [paginatedResult, statusCounts] = await Promise.all([
        getPaginatedBundlesWithAnalytics({
            shop,
            startDate,
            endDate,
            sortBy: repoSortBy,
            sortOrder,
            page,
            perPage,
            search,
        }),
        getBundleStatusCounts(shop),
    ]);

    const totalBundles = Object.values(statusCounts).reduce((a, b) => a + b, 0);

    return {
        bundles: paginatedResult.bundles,
        pagination: paginatedResult.pagination,
        statusCounts,
        totalBundles,
    };
}

/**
 * Map SortField type to repository sort field
 */
function mapSortFieldToRepo(
    sortBy: SortField,
): "revenue" | "views" | "purchases" | "conversion" | "created" {
    return sortBy as
        | "revenue"
        | "views"
        | "purchases"
        | "conversion"
        | "created";
}

/**
 * Filter bundles by status
 */
export function filterBundlesByStatus(
    bundles: BundleWithAnalytics[],
    status: string | null,
): BundleWithAnalytics[] {
    if (!status || status === "all") {
        return bundles;
    }

    return bundles.filter(
        (bundle) => bundle.status.toLowerCase() === status.toLowerCase(),
    );
}

/**
 * Search bundles by title
 */
export function searchBundles(
    bundles: BundleWithAnalytics[],
    searchQuery: string,
): BundleWithAnalytics[] {
    if (!searchQuery || searchQuery.trim() === "") {
        return bundles;
    }

    const query = searchQuery.toLowerCase().trim();

    return bundles.filter((bundle) =>
        bundle.title.toLowerCase().includes(query),
    );
}
