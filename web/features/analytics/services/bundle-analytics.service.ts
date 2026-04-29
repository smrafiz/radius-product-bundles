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
    getBundleTrendsBatch,
    getPaginatedBundlesWithAnalytics,
    getTopPerformingBundles,
} from "@/features/analytics/repositories";
import { formatCurrencyCompact } from "@/shared";
import { stripDeletedSuffix } from "@/features/bundles";
import { getStaticTranslations } from "@/lib/i18n/server";

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

    // Get bundle details and trends in parallel (3 queries total)
    const bundleIds = bundleStats.map((b) => b.bundleId);
    const [bundleDetails, trendsMap] = await Promise.all([
        getBundleDetails(bundleIds),
        getBundleTrendsBatch(
            shop,
            bundleIds,
            currentStart,
            currentEnd,
            previousStart,
            previousEnd,
        ),
    ]);

    const defaultTrend = {
        currentRevenue: 0,
        previousRevenue: 0,
        trendPercentage: 0,
    };

    const results = await Promise.all(bundleStats.map(async (stats) => {
            const details = bundleDetails.find((b) => b.id === stats.bundleId);
            if (!details) return null;

            const trend = trendsMap.get(stats.bundleId) || defaultTrend;
            const badges = await generateBundleBadges(stats, trend);

            return {
                bundleId: stats.bundleId,
                title: stripDeletedSuffix(details.name),
                type: details.type,
                status: details.status,
                discountType: details.discountType,
                discountValue: details.discountValue,
                createdAt: details.createdAt,
                images: details.images,
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
    }));
    return results.filter((b) => b !== null) as TopBundleWithTrend[];
}

/**
 * Generate performance badges for a bundle
 */
export async function generateBundleBadges(stats: any, trend: any): Promise<BundleBadge[]> {
    const t = await getStaticTranslations("Analytics.Badges");
    const badges: BundleBadge[] = [];

    // High Converter Badge
    if (stats.conversionRate >= 15) {
        badges.push({
            icon: "assets/high-converter.svg",
            label: t("highConverter"),
            tone: "success",
            tooltip: t("highConverterTooltip", { rate: stats.conversionRate }),
        });
    }

    // Revenue Star Badge
    if (stats.revenue >= 5000) {
        badges.push({
            icon: "assets/revenue-star.svg",
            label: t("revenueStar"),
            tone: "success",
            tooltip: t("revenueStarTooltip", { revenue: formatCurrencyCompact(stats.revenue) }),
        });
    }

    // Hidden Gem Badge (low views, high conversion)
    if (stats.views < 100 && stats.conversionRate >= 10) {
        badges.push({
            icon: "assets/hidden-gam.svg",
            label: t("hiddenGem"),
            tone: "info",
            tooltip: t("hiddenGemTooltip", { rate: stats.conversionRate, views: stats.views }),
        });
    }

    // Trending Up Badge
    if (trend.trendPercentage >= 25) {
        badges.push({
            icon: "assets/trending.svg",
            label: t("trending"),
            tone: "success",
            tooltip: t("trendingTooltip", { growth: trend.trendPercentage.toFixed(0) }),
        });
    }

    // Needs Attention Badge (declining)
    if (trend.trendPercentage <= -25) {
        badges.push({
            icon: "assets/declining.svg",
            label: t("declining"),
            tone: "attention",
            tooltip: t("decliningTooltip", { drop: Math.abs(trend.trendPercentage).toFixed(0) }),
        });
    }

    // Strong Add-to-Cart Badge
    if (stats.addToCartRate >= 30) {
        badges.push({
            icon: "assets/high-interest.svg",
            label: t("highInterest"),
            tone: "info",
            tooltip: t("highInterestTooltip", { atcRate: stats.addToCartRate.toFixed(0) }),
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
):
    | "revenue"
    | "views"
    | "purchases"
    | "conversion"
    | "created"
    | "name"
    | "status"
    | "type" {
    return sortBy as
        | "revenue"
        | "views"
        | "purchases"
        | "conversion"
        | "created"
        | "name"
        | "status"
        | "type";
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
