/**
 * Bundle Queries - Data Access Layer
 *
 * Read operations only.
 */

import {
    INCLUDE_BUNDLE_DASHBOARD,
    INCLUDE_BUNDLE_DETAILS,
    INCLUDE_BUNDLE_FULL,
    INCLUDE_BUNDLE_PRODUCTS,
    INCLUDE_SETTINGS,
} from "./bundle.fragments";
import type {
    FindByShopFilters,
    FindByShopOptions,
} from "@/features/bundles";
import { prisma } from "@/shared/repositories/prisma-connect";
import { type AppSettings, Prisma } from "@/prisma/generated/client";

// ==========================================
// FIND Operations
// ==========================================

/**
 * Find bundle status by ID (lightweight query for access checks)
 */
export async function findBundleStatusById(id: string, shop: string) {
    return prisma.bundle.findFirst({
        where: { id, shop },
        select: { id: true, status: true, type: true },
    });
}

/**
 * Find only mainProductId and bundleProduct IDs for a bundle.
 * Use instead of findBundleByIdWithAllRelations when only product IDs are needed.
 */
export async function findBundleProductIds(id: string, shop: string) {
    return prisma.bundle.findFirst({
        where: { id, shop },
        select: {
            mainProductId: true,
            bundleProducts: { select: { productId: true } },
        },
    });
}

/**
 * Find bundle by ID
 */
export async function findBundleById(
    id: string,
    shop: string,
    tx?: Prisma.TransactionClient,
) {
    const client = tx || prisma;
    return client.bundle.findFirst({
        where: { id, shop },
        include: INCLUDE_BUNDLE_DETAILS,
    });
}

/**
 * Find bundle by ID with products
 */
export async function findBundleByIdWithProducts(
    id: string,
    shop: string,
    tx?: Prisma.TransactionClient,
) {
    const client = tx || prisma;
    return client.bundle.findFirst({
        where: { id, shop },
        include: INCLUDE_BUNDLE_PRODUCTS,
    });
}

/**
 * Find bundle by ID with all relations (for duplication)
 */
export async function findBundleByIdWithAllRelations(
    id: string,
    shop: string,
    tx?: Prisma.TransactionClient,
) {
    const client = tx || prisma;
    return client.bundle.findFirst({
        where: { id, shop },
        include: INCLUDE_BUNDLE_FULL,
    });
}

/**
 * Find bundle by name
 */
export async function findBundleByName(
    shop: string,
    name: string,
    excludeId?: string,
    tx?: Prisma.TransactionClient,
) {
    const client = tx || prisma;

    return client.bundle.findFirst({
        where: {
            shop,
            name,
            ...(excludeId && { id: { not: excludeId } }),
        },
    });
}

/*
 * Find a unique bundle by name
 */
export async function findUniqueByName(shop: string, name: string) {
    return prisma.bundle.findUnique({
        where: {
            shop_name: { shop, name },
        },
    });
}

/*
 * Check if a bundle name exists (for name conflict detection)
 */
export async function checkNameConflict(
    shop: string,
    name: string,
    excludeId?: string,
): Promise<boolean> {
    const existingBundle = excludeId
        ? await findBundleByName(shop, name, excludeId)
        : await findUniqueByName(shop, name);

    return !!existingBundle;
}

/**
 * Find all bundles with names starting with a pattern
 */
export async function findBundlesByNamePattern(
    shop: string,
    namePattern: string,
    tx?: Prisma.TransactionClient,
): Promise<Array<{ name: string }>> {
    const client = tx || prisma;

    return client.bundle.findMany({
        where: {
            shop,
            status: { not: "DELETED" as const },
            name: {
                startsWith: namePattern,
            },
        },
        select: { name: true },
        orderBy: { createdAt: "desc" },
        take: 100,
    });
}

/**
 * Find bundles by product ID
 */
export async function findBundlesByProductId(
    productId: string,
    shop: string,
    tx?: Prisma.TransactionClient,
) {
    const client = tx || prisma;

    return client.bundle.findMany({
        where: {
            shop,
            status: "ACTIVE",
            bundleProducts: {
                some: { productId },
            },
        },
        include: {
            ...INCLUDE_BUNDLE_PRODUCTS,
            ...INCLUDE_SETTINGS,
        },
    });
}

/**
 * Find multiple bundles of IDs
 */
export async function findBundlesByIds(
    bundleIds: string[],
    shop: string,
    tx?: Prisma.TransactionClient,
) {
    if (!bundleIds.length) {
        return [];
    }

    const client = tx || prisma;

    return client.bundle.findMany({
        where: {
            id: { in: bundleIds },
            shop,
        },
        select: { id: true, name: true, shop: true },
    });
}

/**
 * Find multiple bundles by IDs with all relations (batch version)
 */
export async function findBundlesByIdsWithAllRelations(
    bundleIds: string[],
    shop: string,
    tx?: Prisma.TransactionClient,
) {
    if (!bundleIds.length) return [];

    const client = tx || prisma;

    return client.bundle.findMany({
        where: { id: { in: bundleIds }, shop },
        include: INCLUDE_BUNDLE_FULL,
    });
}

/**
 * Find mainProductIds for given bundle IDs
 */
export async function findMainProductIdsByBundleIds(
    bundleIds: string[],
    shop: string,
    tx?: Prisma.TransactionClient,
): Promise<string[]> {
    if (!bundleIds.length) return [];

    const client = tx || prisma;

    const bundles = await client.bundle.findMany({
        where: { id: { in: bundleIds }, shop },
        select: { mainProductId: true },
    });

    return bundles
        .map((b) => b.mainProductId)
        .filter((id): id is string => id !== null);
}

/**
 * Find bundles by shop with filters and pagination
 */
export async function findBundlesByShop(
    shop: string,
    options?: FindByShopOptions,
) {
    const where: Prisma.BundleWhereInput = {
        shop,
        status: { not: "DELETED" as const },
    };

    // Search filter
    if (options?.search) {
        where.name = {
            contains: options.search,
            mode: "insensitive",
        };
    }

    // Status filter
    if (options?.status?.length) {
        where.status = { in: options.status };
    }

    // Safe dynamic sort
    const ALLOWED_SORT_FIELDS = [
        "id",
        "name",
        "createdAt",
        "updatedAt",
        "status",
        "type",
        "views",
        "revenue",
    ];
    const sortField = ALLOWED_SORT_FIELDS.includes(options?.orderBy || "")
        ? options!.orderBy!
        : "createdAt";

    const sortDirection = options?.orderDirection === "asc" ? "asc" : "desc";

    return prisma.bundle.findMany({
        where,
        include: INCLUDE_BUNDLE_DASHBOARD,
        take: options?.limit || 10,
        skip: options?.offset || 0,
        orderBy: {
            [sortField]: sortDirection,
        },
    });
}

// ==========================================
// COUNT Operations
// ==========================================

/**
 * Count bundles by shop with filters
 */
export async function countBundlesByShop(
    shop: string,
    filters?: FindByShopFilters,
) {
    const where: Prisma.BundleWhereInput = {
        shop,
        status: { not: "DELETED" as const },
    };

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

    return prisma.bundle.count({ where });
}

/**
 * Count active bundles by shop
 */
export async function countActiveBundlesByShop(shop: string) {
    return prisma.bundle.count({
        where: {
            shop,
            status: "ACTIVE",
        },
    });
}

/**
 * Finds all active bundles for a shop.
 */
export async function findActiveBundlesByShop(shop: string) {
    return prisma.bundle.findMany({
        where: { shop, status: "ACTIVE" },
        include: {
            bundleProducts: true,
            settings: true,
        },
    });
}

/**
 * Count recent bundles (created within N minutes)
 */
export async function countRecentBundles(shop: string, minutesAgo: Date) {
    return prisma.bundle.count({
        where: {
            shop,
            status: { not: "DELETED" as const },
            createdAt: { gte: minutesAgo },
        },
    });
}

/**
 * Get bundle creation/deletion activity within a timeframe
 */
export async function getBundleActivity(
    shop: string,
    hoursToCheck: number = 24,
) {
    const since = new Date(Date.now() - hoursToCheck * 60 * 60 * 1000);

    const [createdCount, deletedCount] = await Promise.all([
        prisma.bundle.count({
            where: {
                shop,
                status: { not: "DELETED" as const },
                createdAt: { gte: since },
            },
        }),
        prisma.bundle.count({
            where: {
                shop,
                status: "DELETED",
                deletedAt: { gte: since },
            },
        }),
    ]);

    return {
        created: createdCount,
        deleted: deletedCount,
        since,
    };
}

/**
 * Finds app settings for a shop.
 */
export async function findAppSettingsByShop(
    shopId: string,
): Promise<AppSettings | null> {
    return prisma.appSettings.findUnique({
        where: { shopId },
    });
}

// ==========================================
// SCHEDULING Queries
// ==========================================

/**
 * Finds SCHEDULED bundles where startDate has arrived.
 */
export async function findBundlesReadyToActivate(shop?: string) {
    return prisma.bundle.findMany({
        where: {
            status: "SCHEDULED",
            startDate: { not: null, lte: new Date() },
            ...(shop && { shop }),
        },
        select: {
            id: true,
            shop: true,
            name: true,
            startDate: true,
            mainProductId: true,
        },
    });
}

/**
 * Finds ACTIVE bundles where endDate has passed.
 */
export async function findBundlesReadyToDeactivate(shop?: string) {
    return prisma.bundle.findMany({
        where: {
            status: "ACTIVE",
            endDate: { not: null, lte: new Date() },
            ...(shop && { shop }),
        },
        select: {
            id: true,
            shop: true,
            name: true,
            endDate: true,
            mainProductId: true,
        },
    });
}

/**
 * Returns distinct shops that have bundles needing scheduling transitions.
 */
export async function findShopsWithPendingTransitions(): Promise<string[]> {
    const [toActivate, toDeactivate] = await Promise.all([
        prisma.bundle.findMany({
            where: {
                status: "SCHEDULED",
                startDate: { not: null, lte: new Date() },
            },
            select: { shop: true },
            distinct: ["shop"],
        }),
        prisma.bundle.findMany({
            where: {
                status: "ACTIVE",
                endDate: { not: null, lte: new Date() },
            },
            select: { shop: true },
            distinct: ["shop"],
        }),
    ]);

    const shops = new Set([
        ...toActivate.map((b) => b.shop),
        ...toDeactivate.map((b) => b.shop),
    ]);

    return [...shops];
}
