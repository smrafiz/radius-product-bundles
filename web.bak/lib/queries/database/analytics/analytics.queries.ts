import prisma from "@/lib/db/prisma-connect";

export const analyticsQueries = {
    async aggregateMetrics(shop: string, thirtyDaysAgo: Date, sixtyDaysAgo: Date) {
        const [currentPeriod, previousPeriod, totalRevenueAllTime, totalBundles, activeBundles] =
            await Promise.all([
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
                prisma.bundleAnalytics.aggregate({
                    where: {
                        bundle: { shop },
                    },
                    _sum: { bundleRevenue: true },
                }),
                prisma.bundle.count({ where: { shop } }),
                prisma.bundle.count({ where: { shop, status: "ACTIVE" } }),
            ]);

        return { currentPeriod, previousPeriod, totalRevenueAllTime, totalBundles, activeBundles };
    },
};