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
} from "./bundle.fragments";
import { Prisma } from "@/prisma/generated/client";
import { prisma } from "@/shared/repositories/prisma-connect";
import { FindByShopFilters, FindByShopOptions } from "@/features/bundles";

// ==========================================
// FIND Operations
// ==========================================

/**
 * Find bundle by ID
 */
export async function findBundleById(
    id: string,
    tx?: Prisma.TransactionClient,
) {
    const client = tx || prisma;
    return client.bundle.findUnique({
        where: { id },
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
        include: INCLUDE_BUNDLE_PRODUCTS,
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
 * Find bundles by shop with filters and pagination
 */
export async function findBundlesByShop(
    shop: string,
    options?: FindByShopOptions,
) {
    const where: Prisma.BundleWhereInput = { shop };

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
 * Count recent bundles (created within N minutes)
 */
export async function countRecentBundles(shop: string, minutesAgo: Date) {
    return prisma.bundle.count({
        where: {
            shop,
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

    // Count new bundles created in the given timeframe
    const createdCount = await prisma.bundle.count({
        where: {
            shop,
            createdAt: { gte: since },
        },
    });

    // Count soft-deleted bundles (if `deletedAt` exists)
    let deletedCount = 0;
    try {
        deletedCount = await prisma.bundle.count({
            where: {
                shop,
                deletedAt: { gte: since },
            },
        });
    } catch {
        // ignore if schema doesn't have deletedAt
    }

    return {
        created: createdCount,
        deleted: deletedCount,
        since,
    };
}
