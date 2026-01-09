/**
 * Metric transformers
 */

export function transformBundleMetrics(rawMetrics: {
    currentPeriod: any;
    previousPeriod: any;
    totalRevenueAllTime: any;
    totalBundles: number;
    activeBundles: number;
}) {
    const {
        currentPeriod,
        previousPeriod,
        totalRevenueAllTime,
        totalBundles,
        activeBundles,
    } = rawMetrics;

    // ✅ Current period metrics
    const currentRevenue = currentPeriod._sum.bundleRevenue || 0;
    const currentViews = currentPeriod._sum.bundleViews || 0;
    const currentPurchases = currentPeriod._sum.bundlePurchases || 0;
    const currentAddToCarts = currentPeriod._sum.bundleAddToCarts || 0;

    // ✅ Previous period metrics
    const previousRevenue = previousPeriod._sum.bundleRevenue || 0;
    const previousViews = previousPeriod._sum.bundleViews || 0;
    const previousPurchases = previousPeriod._sum.bundlePurchases || 0;

    // ✅ FIXED: Revenue growth (show 0 if no previous data)
    const revenueGrowth =
        previousRevenue > 0
            ? ((currentRevenue - previousRevenue) / previousRevenue) * 100
            : 0; // ✅ Changed from 100 to 0

    // ✅ Conversion rates
    const conversionRate =
        currentViews > 0 ? (currentPurchases / currentViews) * 100 : 0;

    const previousConversionRate =
        previousViews > 0 ? (previousPurchases / previousViews) * 100 : 0;

    // ✅ FIXED: Conversion growth (show 0 if no previous data)
    const conversionGrowth =
        previousConversionRate > 0
            ? ((conversionRate - previousConversionRate) /
                  previousConversionRate) *
              100
            : 0; // ✅ Changed from 100 to 0

    return {
        totals: {
            totalBundles,
            activeBundles,
            revenue: currentRevenue,
            revenueAllTime: totalRevenueAllTime._sum.bundleRevenue || 0,
            views: currentViews,
            purchases: currentPurchases,
            addToCarts: currentAddToCarts,
        },
        metrics: {
            conversionRate, // ✅ Already as percentage (14.286)
            avgOrderValue:
                currentPurchases > 0 ? currentRevenue / currentPurchases : 0,
            cartConversionRate:
                currentAddToCarts > 0
                    ? (currentPurchases / currentAddToCarts) * 100
                    : 0,
        },
        growth: {
            revenue: revenueGrowth,
            conversion: conversionGrowth,
        },
    };
}
