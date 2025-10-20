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
import { bundleFragments } from "../bundle.fragments";

/**
 * Bundle Queries - Database Layer
 */
export const bundleQueries = {
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