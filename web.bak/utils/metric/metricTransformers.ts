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

    const currentRevenue = currentPeriod._sum.bundleRevenue || 0;
    const currentViews = currentPeriod._sum.bundleViews || 0;
    const currentPurchases = currentPeriod._sum.bundlePurchases || 0;
    const currentAddToCarts = currentPeriod._sum.bundleAddToCarts || 0;

    const previousRevenue = previousPeriod._sum.bundleRevenue || 0;
    const previousViews = previousPeriod._sum.bundleViews || 0;
    const previousPurchases = previousPeriod._sum.bundlePurchases || 0;

    const revenueGrowth =
        previousRevenue > 0
            ? ((currentRevenue - previousRevenue) / previousRevenue) * 100
            : currentRevenue > 0
                ? 100
                : 0;

    const conversionRate =
        currentViews > 0 ? (currentPurchases / currentViews) * 100 : 0;
    const previousConversionRate =
        previousViews > 0 ? (previousPurchases / previousViews) * 100 : 0;
    const conversionGrowth =
        previousConversionRate > 0
            ? ((conversionRate - previousConversionRate) /
                previousConversionRate) *
            100
            : conversionRate > 0
                ? 100
                : 0;

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
            conversionRate,
            avgOrderValue:
                currentPurchases > 0
                    ? currentRevenue / currentPurchases
                    : 0,
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