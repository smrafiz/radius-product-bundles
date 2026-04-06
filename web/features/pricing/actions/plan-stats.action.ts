"use server";

import { handleSessionToken } from "@/lib/shopify";
import { aggregateBundleMetrics } from "@/features/analytics/repositories/analytics.queries";

export interface PlanStatsResult {
    totalRevenue: number;
    ordersLast30Days: number;
    activeBundles: number;
}

export async function getPlanStatsAction(sessionToken: string): Promise<PlanStatsResult> {
    try {
        const { shop } = await handleSessionToken(sessionToken);
        const now = new Date();
        const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

        const metrics = await aggregateBundleMetrics(shop, thirtyDaysAgo, sixtyDaysAgo);

        return {
            totalRevenue: metrics.totalRevenueAllTime._sum.bundleRevenue ?? 0,
            ordersLast30Days: metrics.currentPeriod._sum.bundlePurchases ?? 0,
            activeBundles: metrics.activeBundles,
        };
    } catch {
        return { totalRevenue: 0, ordersLast30Days: 0, activeBundles: 0 };
    }
}
