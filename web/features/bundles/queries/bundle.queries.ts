import {
    BundleStatus,
    CreateBundleInput,
    FindByShopFilters,
    FindByShopOptions,
    UpdateBundleInput,
} from "@/features/bundles";
import { Prisma } from "@prisma/client";
import { generateBundleId } from "@/shared";
import prisma from "@/lib/db/prisma-connect";
import { bundleFragments } from "./bundle.fragments";

/**
 * Bundle Queries - Database Layer (Type-Safe & Optimized)
 */
export const bundleQueries = {
    /**
     * Create a new bundle
     */
    create: async (
        tx: Prisma.TransactionClient,
        data: CreateBundleInput
    ) => {
        const id = generateBundleId();

        return await tx.bundle.create({
            data: {
                id,
                shop: data.shop,
                name: data.name,
                description: data.description,
                type: data.type,
                status: data.status || "DRAFT",
                mainProductId: data.mainProductId,
                buyQuantity: data.buyQuantity,
                getQuantity: data.getQuantity,
                minimumItems: data.minimumItems,
                maximumItems: data.maximumItems,
                discountType: data.discountType,
                discountValue: data.discountValue,
                minOrderValue: data.minOrderValue,
                maxDiscountAmount: data.maxDiscountAmount,
                volumeTiers: data.volumeTiers ?? Prisma.JsonNull,
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

    /**
     * Find bundle by ID
     */
    findById: async (
        id: string,
        tx?: Prisma.TransactionClient
    ) => {
        const client = tx || prisma;
        return await client.bundle.findUnique({
            where: { id },
            ...bundleFragments.withDetails,
        });
    },

    /**
     * Find a bundle by ID with products (for detail view)
     */
    findByIdWithProducts: async (
        id: string,
        shop: string,
        tx?: Prisma.TransactionClient
    ) => {
        const client = tx || prisma;
        return await client.bundle.findFirst({
            where: { id, shop },
            include: {
                bundleProducts: {
                    orderBy: { displayOrder: "asc" },
                },
            },
        });
    },

    /**
     * Find a bundle by ID with all relations (for duplication)
     */
    findByIdWithAllRelations: async (
        id: string,
        shop: string,
        tx?: Prisma.TransactionClient
    ) => {
        const client = tx || prisma;
        return await client.bundle.findFirst({
            where: { id, shop },
            include: {
                bundleProducts: true,
                productGroups: true,
                settings: true,
            },
        });
    },

    /**
     * Find bundle by name
     */
    findByName: async (
        shop: string,
        name: string,
        tx?: Prisma.TransactionClient
    ) => {
        const client = tx || prisma;
        return await client.bundle.findFirst({
            where: { shop, name },
        });
    },

    /**
     * Find bundle by name excluding specific ID
     */
    findByNameWithExclusion: async (
        shop: string,
        name: string,
        excludeId: string,
        tx?: Prisma.TransactionClient
    ) => {
        const client = tx || prisma;
        return await client.bundle.findFirst({
            where: {
                shop,
                name,
                id: { not: excludeId },
            },
        });
    },

    /**
     * Find bundles by product ID
     */
    findByProductId: async (
        productId: string,
        shop: string,
        tx?: Prisma.TransactionClient
    ) => {
        const client = tx || prisma;
        return await client.bundle.findMany({
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

    /**
     * Find multiple bundles by IDs
     */
    findByIds: async (
        bundleIds: string[],
        shop: string,
        tx?: Prisma.TransactionClient
    ) => {
        const client = tx || prisma;
        return await client.bundle.findMany({
            where: {
                id: { in: bundleIds },
                shop,
            },
            select: { id: true, name: true, shop: true },
        });
    },

    /**
     * Find bundles by shop with filters
     */
    findByShop: async (
        shop: string,
        options?: FindByShopOptions
    ) => {
        const where: Prisma.BundleWhereInput = { shop };

        // Apply search filter
        if (options?.search) {
            where.name = {
                contains: options.search,
                mode: "insensitive",
            };
        }

        // Apply status filter
        if (options?.status && options.status.length > 0) {
            where.status = { in: options.status };
        }

        // Apply type filter
        if (options?.type && options.type.length > 0) {
            where.type = { in: options.type };
        }

        return await prisma.bundle.findMany({
            where,
            ...bundleFragments.forDashboard,
            take: options?.limit || 10,
            skip: options?.offset || 0,
            orderBy: {
                [options?.orderBy || "createdAt"]:
                    options?.orderDirection || "desc",
            },
        });
    },

    /**
     * Count bundles by shop with filters
     */
    countByShop: async (
        shop: string,
        filters?: FindByShopFilters
    ) => {
        const where: Prisma.BundleWhereInput = { shop };

        if (filters?.search) {
            where.name = {
                contains: filters.search,
                mode: "insensitive",
            };
        }

        if (filters?.status && filters.status.length > 0) {
            where.status = { in: filters.status };
        }

        if (filters?.type && filters.type.length > 0) {
            where.type = { in: filters.type };
        }

        return await prisma.bundle.count({ where });
    },

    /**
     * Count active bundles by shop
     */
    countActiveByShop: async (shop: string) => {
        return await prisma.bundle.count({
            where: {
                shop,
                status: "ACTIVE",
            },
        });
    },

    /**
     * Count recent bundles
     */
    countRecent: async (shop: string, minutes: number = 1) => {
        return await prisma.bundle.count({
            where: {
                shop,
                createdAt: {
                    gte: bundleFragments.dates.recentMinutes(minutes),
                },
            },
        });
    },

    /**
     * Update bundle by ID
     */
    updateById: async (
        tx: Prisma.TransactionClient,
        id: string,
        data: UpdateBundleInput
    ) => {
        return await tx.bundle.update({
            where: { id },
            data,
        });
    },

    /**
     * Update bundle status by ID
     */
    updateStatusById: async (
        id: string,
        shop: string,
        status: BundleStatus
    ) => {
        const bundle = await prisma.bundle.findFirst({
            where: { id, shop },
            select: { id: true, name: true },
        });

        if (!bundle) {
            throw new Error(
                "Bundle not found or you don't have permission to update it"
            );
        }

        return prisma.bundle.update({
            where: { id },
            data: { status },
            select: {
                id: true,
                name: true,
                status: true,
                updatedAt: true,
            },
        });
    },

    /**
     * Update status for multiple bundles
     */
    updateStatusByIds: async (
        tx: Prisma.TransactionClient,
        bundleIds: string[],
        status: BundleStatus
    ) => {
        return await tx.bundle.updateMany({
            where: { id: { in: bundleIds } },
            data: { status },
        });
    },

    /**
     * Delete bundle by ID
     */
    deleteById: async (tx: Prisma.TransactionClient, id: string) => {
        return await tx.bundle.delete({
            where: { id },
        });
    },

    /**
     * Delete multiple bundles
     */
    deleteMany: async (
        tx: Prisma.TransactionClient,
        bundleIds: string[]
    ) => {
        return await tx.bundle.deleteMany({
            where: { id: { in: bundleIds } },
        });
    },

    /**
     * Delete a bundle by ID with ownership verification
     */
    deleteByIdWithOwnership: async (
        tx: Prisma.TransactionClient,
        id: string,
        shop: string
    ) => {
        const bundle = await tx.bundle.findFirst({
            where: { id, shop },
            select: { id: true, name: true },
        });

        if (!bundle) {
            throw new Error(
                "Bundle not found or you don't have permission to delete it"
            );
        }

        await tx.bundle.delete({
            where: { id },
        });

        return bundle;
    },

    /**
     * Delete multiple bundles with ownership verification
     */
    deleteManyWithOwnership: async (
        tx: Prisma.TransactionClient,
        ids: string[],
        shop: string
    ) => {
        // Verify all bundles belong to the shop
        const existingBundles = await tx.bundle.findMany({
            where: {
                id: { in: ids },
                shop,
            },
            select: { id: true, name: true },
        });

        if (existingBundles.length !== ids.length) {
            throw new Error(
                "Some bundles not found or you don't have permission to delete them"
            );
        }

        await tx.bundle.deleteMany({
            where: { id: { in: ids } },
        });

        return existingBundles;
    },

    /**
     * Generate unique bundle name for duplication
     */
    generateUniqueName: async (shop: string, baseName: string) => {
        let counter = 1;
        let newName = `${baseName} (Copy)`;

        while (await bundleQueries.findByName(shop, newName)) {
            newName = `${baseName} (Copy ${++counter})`;
        }

        return newName;
    },

    /**
     * Get bundle analytics summary
     */
    getAnalyticsSummary: async (shop: string, bundleId?: string) => {
        const where: Prisma.BundleWhereInput = { shop };
        if (bundleId) where.id = bundleId;

        return await prisma.bundle.aggregate({
            where,
            _sum: {
                views: true,
                conversions: true,
                revenue: true,
            },
            _count: true,
        });
    },

    /**
     * Get metrics with Promise.all (already optimized ✅)
     */
    getMetrics: async (shop: string) => {
        const thirtyDaysAgo = bundleFragments.dates.thirtyDaysAgo();
        const sixtyDaysAgo = bundleFragments.dates.sixtyDaysAgo();

        // ✅ Promise.all is correct here - parallel reads
        const [currentPeriod, previousPeriod, allTimeRevenue] = await Promise.all([
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
            // Add all-time revenue query
            prisma.bundleAnalytics.aggregate({
                where: {
                    bundle: { shop },
                },
                _sum: {
                    bundleRevenue: true,
                },
            }),
        ]);

        return { currentPeriod, previousPeriod, allTimeRevenue };
    },
};