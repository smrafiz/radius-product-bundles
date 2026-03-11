"use server";

import type { TopBundle } from "@/features/analytics";
import {
    getRecentActiveBundles,
    getAnalyticsForBundles,
} from "@/features/dashboard/repositories/recent-bundles.repository";

export async function getRecentBundlesService({
    shop,
    limit = 5,
}: {
    shop: string;
    limit?: number;
}): Promise<TopBundle[]> {
    const bundles = await getRecentActiveBundles(shop, limit);

    if (bundles.length === 0) {
        return [];
    }

    const bundleIds = bundles.map((b) => b.id);
    const analyticsRaw = await getAnalyticsForBundles(bundleIds);

    const analyticsMap = new Map(
        analyticsRaw.map((a) => [a.bundleId, a._sum]),
    );

    return bundles.map((b) => {
        const stats = analyticsMap.get(b.id);
        const views = stats?.bundleViews ?? 0;
        const purchases = stats?.bundlePurchases ?? 0;
        const revenue = Number(stats?.bundleRevenue ?? 0);
        const addToCarts = stats?.bundleAddToCarts ?? 0;

        return {
            bundleId: b.id,
            title: b.name,
            type: b.type,
            status: b.status,
            discountType: b.discountType,
            discountValue: b.discountValue ? Number(b.discountValue) : null,
            createdAt: b.createdAt,
            images: b.images,
            revenue,
            purchases,
            views,
            addToCarts,
            conversionRate: views > 0 ? (purchases / views) * 100 : 0,
            addToCartRate: views > 0 ? (addToCarts / views) * 100 : 0,
            revenuePerView: views > 0 ? revenue / views : 0,
            trendPercentage: 0,
            badges: [],
        };
    });
}
