import prisma from "@/lib/db/prisma-connect";
import { bundleFragments, dateRanges } from "@/lib/queries";

export const bundleQueries = {
    // Create
    async create(data: any) {
        return await prisma.bundle.create({
            data: {
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

    // Read operations
    async findById(id: string) {
        return await prisma.bundle.findUnique({
            where: { id },
            ...bundleFragments.withDetails,
        });
    },

    async findByName(shop: string, name: string) {
        return await prisma.bundle.findUnique({
            where: {
                shop_name: { shop, name },
            },
        });
    },

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

    // Validation queries
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

    // Update
    async updateById(id: string, data: any) {
        return await prisma.bundle.update({
            where: { id },
            data,
        });
    },

    // Delete
    async deleteById(id: string) {
        return await prisma.bundle.delete({
            where: { id },
        });
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
