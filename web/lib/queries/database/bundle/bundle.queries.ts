import prisma from "@/lib/db/prisma-connect";
import { bundleFragments, dateRanges } from "@/lib/queries";
import { generateBundleId } from "@/utils";

export const bundleQueries = {
    // Create bundle
    async create(data: any) {
        const id = generateBundleId();

        return await prisma.bundle.create({
            data: {
                id,
                shop: data.shop,
                name: data.name,
                description: data.description,
                type: data.type,
                status: "DRAFT",
                mainProductId: data.mainProductId,
                buyQuantity: data.buyQuantity,
                getQuantity: data.getQuantity,
                minimumItems: data.minimumItems,
                maximumItems: data.maximumItems,
                discountType: data.discountType,
                discountValue: data.discountValue,
                minOrderValue: data.minOrderValue,
                maxDiscountAmount: data.maxDiscountAmount,
                volumeTiers: data.volumeTiers,
                allowMixAndMatch: data.allowMixAndMatch,
                mixAndMatchPrice: data.mixAndMatchPrice,
                marketingCopy: data.marketingCopy,
                seoTitle: data.seoTitle,
                seoDescription: data.seoDescription,
                images: data.images || [],
                startDate: data.startDate,
                endDate: data.endDate,
                views: 0,
                conversions: 0,
                revenue: 0,
                aiOptimized: false,
            },
        });
    },

    // Find bundle by ID
    async findById(id: string) {
        return await prisma.bundle.findUnique({
            where: { id },
            ...bundleFragments.withDetails,
        });
    },

    // Find bundle by name
    async findByName(shop: string, name: string) {
        return await prisma.bundle.findUnique({
            where: {
                shop_name: { shop, name },
            },
        });
    },

    // Find bundles by shop
    async findByShop(
        shop: string,
        options?: {
            status?: string;
            type?: string;
            limit?: number;
            offset?: number;
        },
    ) {
        return await prisma.bundle.findMany({
            where: {
                shop,
                ...(options?.status && { status: options.status as any }),
                ...(options?.type && { type: options.type as any }),
            },
            ...bundleFragments.forDashboard,
            take: options?.limit || 10,
            skip: options?.offset || 0,
        });
    },

    // Find bundles by main product
    async findByMainProduct(mainProductId: string) {
        return await prisma.bundle.findMany({
            where: {
                mainProductId,
                status: "ACTIVE",
            },
            include: {
                bundleProducts: {
                    where: {
                        productId: { not: mainProductId },
                    },
                    orderBy: { displayOrder: "asc" },
                },
                settings: true,
            },
        });
    },

    // Find bundles by product ID
    async findByProductId(productId: string, shop: string) {
        return await prisma.bundle.findMany({
            where: {
                shop,
                status: "ACTIVE",
                bundleProducts: {
                    some: {
                        productId,
                    },
                },
            },
            ...bundleFragments.withProducts,
        });
    },

    // Count recent bundles
    async countRecent(shop: string, minutes: number = 1) {
        return await prisma.bundle.count({
            where: {
                shop,
                createdAt: {
                    gte: dateRanges.recentMinutes(minutes),
                },
            },
        });
    },

    // Update bundle by ID
    async updateById(id: string, data: any) {
        return await prisma.bundle.update({
            where: { id },
            data,
        });
    },

    // Delete bundle by ID
    async deleteById(id: string) {
        return await prisma.bundle.delete({
            where: { id },
        });
    },

    // Delete bundles by IDs
    async deleteMany(ids: string[]) {
        return await prisma.bundle.deleteMany({
            where: { id: { in: ids } },
        });
    },

    // Delete bundles by shop
    async deleteByIdWithOwnership(id: string, shop: string) {
        // First verify ownership, then delete
        const bundle = await prisma.bundle.findFirst({
            where: { id, shop },
            select: { id: true, name: true },
        });

        if (!bundle) {
            throw new Error(
                "Bundle not found or you don't have permission to delete it",
            );
        }

        await prisma.bundle.delete({
            where: { id },
        });

        return bundle;
    },

    // Delete bundles by IDs with ownership
    async deleteManyWithOwnership(ids: string[], shop: string) {
        // First, verify all bundles belong to the shop
        const existingBundles = await prisma.bundle.findMany({
            where: {
                id: { in: ids },
                shop,
            },
            select: { id: true, name: true },
        });

        if (existingBundles.length !== ids.length) {
            throw new Error(
                "Some bundles not found or you don't have permission to delete them",
            );
        }

        await prisma.bundle.deleteMany({
            where: { id: { in: ids } },
        });

        return existingBundles;
    },

    // Analytics queries
    async getMetrics(shop: string) {
        const thirtyDaysAgo = dateRanges.thirtyDaysAgo();
        const sixtyDaysAgo = dateRanges.sixtyDaysAgo();

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

        return { currentPeriod, previousPeriod };
    },
};
