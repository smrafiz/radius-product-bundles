"use server";

import prisma from "@/lib/db/prisma-connect";
import { handleSessionToken } from "@/lib/shopify/verify";

/**
 * Get bundles for a shop
 */
export async function getBundles(sessionToken: string) {
    try {
        const {
            session: { shop },
        } = await handleSessionToken(sessionToken);

        const bundles = await prisma.bundle.findMany({
            where: { shop },
            include: {
                bundleProducts: {
                    orderBy: { displayOrder: "asc" },
                },
                _count: {
                    select: {
                        analytics: true,
                    },
                },
            },
            orderBy: { updatedAt: "desc" },
            take: 10, // For the dashboard view.
        });

        const transformedBundles = bundles.map((bundle) => ({
            id: bundle.id,
            name: bundle.name,
            type: bundle.type,
            status: bundle.status,
            views: bundle.views,
            conversions: bundle.conversions,
            revenue: bundle.revenue,
            conversionRate:
                bundle.views > 0
                    ? (bundle.conversions / bundle.views) * 100
                    : 0,
            productCount: bundle.bundleProducts.length,
            createdAt: bundle.createdAt.toISOString(),
        }));

        return {
            status: "success" as const,
            data: transformedBundles,
        };
    } catch (error) {
        console.error("Failed to fetch bundles:", error);
        return {
            status: "error" as const,
            message: "Failed to fetch bundles",
            data: [],
        };
    }
}

/**
 * Get bundle metrics for a shop
 */
export async function getBundleMetrics(sessionToken: string) {
    try {
        const {
            session: { shop },
        } = await handleSessionToken(sessionToken);

        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const sixtyDaysAgo = new Date();
        sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);

        const [currentPeriod, previousPeriod] = await Promise.all([
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
        ]);

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
            status: "success" as const,
            data: {
                totals: {
                    revenue: currentRevenue,
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
            },
        };
    } catch (error) {
        console.error("Failed to fetch metrics:", error);
        return {
            status: "error" as const,
            message: "Failed to fetch metrics",
            data: {
                totals: { revenue: 0, views: 0, purchases: 0, addToCarts: 0 },
                metrics: {
                    conversionRate: 0,
                    avgOrderValue: 0,
                    cartConversionRate: 0,
                },
                growth: { revenue: 0, conversion: 0 },
            },
        };
    }
}
