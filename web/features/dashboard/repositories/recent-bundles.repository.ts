"use server";

import prisma from "@/shared/repositories/prisma-connect";

export async function getRecentActiveBundles(shop: string, limit: number) {
    return prisma.bundle.findMany({
        where: {
            shop,
            status: "ACTIVE",
        },
        orderBy: { updatedAt: "desc" },
        take: limit,
        select: {
            id: true,
            name: true,
            type: true,
            status: true,
            discountType: true,
            discountValue: true,
            createdAt: true,
            images: true,
            mainProductId: true,
        },
    });
}

export async function getAnalyticsForBundles(bundleIds: string[]) {
    return prisma.bundleAnalytics.groupBy({
        by: ["bundleId"],
        where: { bundleId: { in: bundleIds } },
        _sum: {
            bundleViews: true,
            bundlePurchases: true,
            bundleRevenue: true,
            bundleAddToCarts: true,
        },
    });
}
