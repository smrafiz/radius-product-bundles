/**
 * Bundle Mutations - Data Access Layer
 *
 * Write operations.
 */

/**
 * Normalize schedule dates: startDate → start of day UTC, endDate → end of day UTC.
 * Ensures date-only scheduling works correctly with lte comparisons.
 */
function normalizeScheduleDates(startDate?: Date | null, endDate?: Date | null) {
    return {
        startDate: startDate ? startOfDayUTC(startDate) : startDate,
        endDate: endDate ? endOfDayUTC(endDate) : endDate,
    };
}

function startOfDayUTC(date: Date): Date {
    const d = new Date(date);
    d.setUTCHours(0, 0, 0, 0);
    return d;
}

function endOfDayUTC(date: Date): Date {
    const d = new Date(date);
    d.setUTCHours(23, 59, 59, 999);
    return d;
}

import {
    BundleStatus,
    CreateBundleInput,
    DeleteBundleResult,
    UpdateBundleInput,
    UpdateBundleInputWithRelations,
} from "@/features/bundles";
import {
    findBundleByIdWithAllRelations,
    findBundlesByIds,
    findMainProductIdsByBundleIds,
    verifyBundleOwnership,
    verifyBundleOwnershipTx,
    verifyMultipleBundlesOwnershipTx,
} from "@/features/bundles/repositories";
import { generateBundleId } from "@/shared";
import { prisma } from "@/shared/repositories/prisma-connect";
import { BundleProductRole, DiscountApplication, Prisma } from "@/prisma/generated/client";

// ==========================================
// CREATE Operations
// ==========================================

/**
 * Create a new bundle (within transaction)
 */
export async function createBundle(
    tx: Prisma.TransactionClient,
    data: CreateBundleInput,
) {
    const id = generateBundleId();

    return tx.bundle.create({
        data: {
            id,
            shop: data.shop,
            name: data.name,
            description: data.description,
            type: data.type,
            status: data.status || "DRAFT",
            mainProductId: data.mainProductId,
            mainVariantId: data.mainVariantId,
            buyQuantity: data.buyQuantity,
            getQuantity: data.getQuantity,
            usesPerOrderLimit: data.usesPerOrderLimit ?? null,
            minimumItems: data.minimumItems,
            maximumItems: data.maximumItems,
            discountType: data.discountType,
            discountValue: data.discountValue,
            minOrderValue: data.minOrderValue,
            maxDiscountAmount: data.maxDiscountAmount,
            volumeTiers: data.volumeTiers ?? Prisma.JsonNull,
            allowMixAndMatch: data.allowMixAndMatch,
            mixAndMatchPrice: data.mixAndMatchPrice,
            discountApplication: data.discountApplication ?? DiscountApplication.BUNDLE,
            discountedProductIds: data.discountedProductIds ?? [],
            freeShipping: data.freeShipping ?? false,
            priority: data.priority ?? 0,
            marketingCopy: data.marketingCopy,
            seoTitle: data.seoTitle,
            seoDescription: data.seoDescription,
            images: data.images || [],
            ...normalizeScheduleDates(data.startDate, data.endDate),
            views: 0,
            conversions: 0,
            revenue: 0,
            aiOptimized: false,
        },
    });
}

/**
 * Create bundle products (within transaction)
 */
export async function createBundleProducts(
    tx: Prisma.TransactionClient,
    bundleId: string,
    products: Array<{
        productId: string;
        variantId?: string | null;
        quantity: number;
        role?: string;
        displayOrder?: number;
    }>,
) {
    return tx.bundleProduct.createMany({
        data: products.map((product, index) => ({
            bundleId,
            productId: product.productId,
            variantId: product.variantId || null,
            quantity: product.quantity,
            role: (product.role as BundleProductRole) || "INCLUDED",
            displayOrder: product.displayOrder ?? index,
        })),
    });
}

/**
 * Create bundle settings (within transaction)
 */
export async function createBundleSettings(
    tx: Prisma.TransactionClient,
    bundleId: string,
    settings: any,
) {
    return tx.bundleSettings.create({
        data: {
            bundleId,
            ...settings,
        },
    });
}

/*
 * Create bundle product groups (within transaction)
 */
export async function createBundleProductGroups(
    tx: any,
    bundleId: string,
    groups: any[],
) {
    return await tx.bundleProductGroup.createMany({
        data: groups.map((g, index) => ({
            bundleId,
            name: g.name,
            description: g.description || null,
            minSelection: g.minSelection || 0,
            maxSelection: g.maxSelection || null,
            displayOrder: g.displayOrder ?? index,
        })),
    });
}

/**
 * Create a bundle along with its products, product groups, and settings.
 * Executes all operations inside a single transaction.
 */
export async function createBundleWithRelations(data: CreateBundleInput) {
    return prisma.$transaction(async (tx: Prisma.TransactionClient) => {
        // Check name uniqueness inside transaction (prevents TOCTOU race)
        const existing = await tx.bundle.findFirst({
            where: {
                shop: data.shop,
                name: data.name,
                status: { not: "DELETED" as const },
            },
            select: { id: true },
        });
        if (existing) {
            throw new Error(
                `A bundle with the name "${data.name}" already exists`,
            );
        }

        const bundle = await createBundle(tx, data);

        // Step 2: Create bundle products
        if (data.products?.length) {
            await createBundleProducts(tx, bundle.id, data.products);
        }

        // Step 3: Create bundle product groups
        if (data.productGroups?.length) {
            await createBundleProductGroups(tx, bundle.id, data.productGroups);
        }

        // Step 4: Create bundle settings
        if (data.settings) {
            await createBundleSettings(tx, bundle.id, data.settings);
        }

        // Step 5: Return the bundle with all relations
        return await findBundleByIdWithAllRelations(bundle.id, data.shop, tx);
    });
}

/**
 * Diff-based product update: compare existing vs new products,
 * delete removed, update changed, create new.
 */
async function diffUpdateProducts(
    tx: Prisma.TransactionClient,
    bundleId: string,
    newProducts: Array<{
        productId: string;
        variantId?: string | null;
        quantity: number;
        role?: string;
        displayOrder?: number;
    }>,
) {
    const existing = await tx.bundleProduct.findMany({
        where: { bundleId },
        select: {
            id: true,
            productId: true,
            variantId: true,
            quantity: true,
            role: true,
            displayOrder: true,
        },
    });

    const makeKey = (p: {
        productId: string;
        variantId?: string | null;
        role?: string;
    }) => `${p.productId}:${p.variantId || ""}:${p.role || "INCLUDED"}`;

    const existingMap = new Map(existing.map((p) => [makeKey(p), p]));
    const newMap = new Map(
        newProducts.map((p, i) => [
            makeKey(p),
            { ...p, displayOrder: p.displayOrder ?? i },
        ]),
    );

    // Products to delete: in existing but not in new
    const toDelete = existing.filter((p) => !newMap.has(makeKey(p)));

    // Products to create: in new but not in existing
    const toCreate = newProducts
        .map((p, i) => ({ ...p, displayOrder: p.displayOrder ?? i }))
        .filter((p) => !existingMap.has(makeKey(p)));

    // Products to update: in both, but fields changed
    const toUpdate: Array<{
        id: string;
        quantity: number;
        displayOrder: number;
    }> = [];
    for (const [key, newP] of newMap) {
        const existP = existingMap.get(key);
        if (
            existP &&
            (existP.quantity !== newP.quantity ||
                existP.displayOrder !== newP.displayOrder)
        ) {
            toUpdate.push({
                id: existP.id,
                quantity: newP.quantity,
                displayOrder: newP.displayOrder,
            });
        }
    }

    const ops: Promise<unknown>[] = [];

    if (toDelete.length > 0) {
        ops.push(
            tx.bundleProduct.deleteMany({
                where: { id: { in: toDelete.map((p) => p.id) } },
            }),
        );
    }

    if (toCreate.length > 0) {
        ops.push(
            tx.bundleProduct.createMany({
                data: toCreate.map((p) => ({
                    bundleId,
                    productId: p.productId,
                    variantId: p.variantId || null,
                    quantity: p.quantity,
                    role: (p.role as BundleProductRole) || "INCLUDED",
                    displayOrder: p.displayOrder,
                })),
            }),
        );
    }

    for (const u of toUpdate) {
        ops.push(
            tx.bundleProduct.update({
                where: { id: u.id },
                data: { quantity: u.quantity, displayOrder: u.displayOrder },
            }),
        );
    }

    if (ops.length > 0) {
        await Promise.all(ops);
    }
}

// ==========================================
// UPDATE Operations
// ==========================================

/**
 * Update bundle by ID (within transaction)
 */
export async function updateBundleById(
    tx: Prisma.TransactionClient,
    id: string,
    data: UpdateBundleInput,
) {
    return tx.bundle.update({
        where: { id },
        data,
    });
}

/**
 * Update an existing bundle with all its relations in a transaction
 */
export async function updateBundleWithRelations(
    data: UpdateBundleInputWithRelations,
) {
    return prisma.$transaction(async (tx: Prisma.TransactionClient) => {
        // Check name uniqueness inside transaction (prevents TOCTOU race)
        if (data.nameChanged) {
            const existing = await tx.bundle.findFirst({
                where: {
                    shop: data.shop,
                    name: data.name,
                    id: { not: data.bundleId },
                    status: { not: "DELETED" as const },
                },
                select: { id: true },
            });
            if (existing) {
                throw new Error(
                    `A bundle with the name "${data.name}" already exists`,
                );
            }
        }

        await updateBundleById(tx, data.bundleId, {
            name: data.name,
            description: data.description,
            type: data.type,
            status: data.status,
            discountType: data.discountType,
            discountValue: data.discountValue,
            minOrderValue: data.minOrderValue ?? null,
            maxDiscountAmount: data.maxDiscountAmount ?? null,
            buyQuantity: data.buyQuantity ?? null,
            getQuantity: data.getQuantity ?? null,
            usesPerOrderLimit: data.usesPerOrderLimit ?? null,
            ...normalizeScheduleDates(data.startDate ?? null, data.endDate ?? null),
            mainProductId: data.mainProductId ?? null,
            mainVariantId: data.mainVariantId ?? null,
            volumeTiers: data.volumeTiers ?? Prisma.JsonNull,
            discountApplication: data.discountApplication || DiscountApplication.BUNDLE,
            discountedProductIds: data.discountedProductIds ?? [],
            freeShipping: data.freeShipping ?? false,
            priority: data.priority ?? 0,
            images: data.images || [],
        });

        // Diff-based product update: only delete removed, create new, update changed
        await diffUpdateProducts(tx, data.bundleId, data.products || []);

        await deleteBundleProductGroups(tx, data.bundleId);

        if (data.productGroups?.length) {
            await createBundleProductGroups(
                tx,
                data.bundleId,
                data.productGroups,
            );
        }

        if (data.settings) {
            await tx.bundleSettings.upsert({
                where: { bundleId: data.bundleId },
                update: data.settings as Prisma.BundleSettingsUpdateInput,
                create: { bundleId: data.bundleId, ...data.settings },
            });
        } else {
            await deleteBundleSettings(tx, data.bundleId);
        }

        return await findBundleByIdWithAllRelations(
            data.bundleId,
            data.shop,
            tx,
        );
    });
}

/**
 * Update bundle status by ID (standalone)
 */
export async function updateBundleStatusById(
    id: string,
    shop: string,
    status: BundleStatus,
    startDate?: Date,
    endDate?: Date,
) {
    // Verify ownership first
    await verifyBundleOwnership(id, shop);

    // Update status (include dates for SCHEDULED)
    const normalized = normalizeScheduleDates(startDate, endDate);
    return prisma.bundle.update({
        where: { id },
        data: {
            status,
            ...(startDate !== undefined && { startDate: normalized.startDate }),
            ...(endDate !== undefined && { endDate: normalized.endDate }),
        },
        select: {
            id: true,
            name: true,
            status: true,
            startDate: true,
            endDate: true,
            updatedAt: true,
            mainProductId: true,
        },
    });
}

/**
 * Update status for multiple bundles (within transaction)
 */
export async function updateBundlesStatusByIds(
    tx: Prisma.TransactionClient,
    bundleIds: string[],
    status: BundleStatus,
) {
    return tx.bundle.updateMany({
        where: { id: { in: bundleIds } },
        data: { status },
    });
}

/**
 * Bulk update bundle statuses in a single atomic transaction.
 * Verifies ownership, fetches mainProductIds, updates statuses.
 */
export async function bulkUpdateBundleStatuses(
    bundleIds: string[],
    shop: string,
    status: BundleStatus,
) {
    return prisma.$transaction(
        async (tx) => {
            const existingBundles = await findBundlesByIds(bundleIds, shop, tx);

            if (existingBundles.length === 0) {
                return {
                    updatedCount: 0,
                    failedCount: bundleIds.length,
                    mainProductIds: [] as string[],
                };
            }

            const foundIds = existingBundles.map((b) => b.id);
            const notFoundIds = bundleIds.filter(
                (id) => !foundIds.includes(id),
            );

            const mainProductIds = await findMainProductIdsByBundleIds(
                foundIds,
                shop,
                tx,
            );

            await updateBundlesStatusByIds(tx, foundIds, status);

            return {
                updatedCount: foundIds.length,
                failedCount: notFoundIds.length,
                mainProductIds,
            };
        },
        { timeout: 15000 },
    );
}

/*
 * Update bundle settings (within transaction)
 */
export async function updateBundleSettings(
    tx: Prisma.TransactionClient,
    bundleId: string,
    settings: Prisma.BundleSettingsUpdateInput,
) {
    return tx.bundleSettings.update({
        where: { bundleId },
        data: settings,
    });
}

/**
 * Update bundle metrics (within transaction)
 */
export async function updateBundleMetrics(
    tx: Prisma.TransactionClient,
    bundleId: string,
    metrics: {
        views?: number;
        conversions?: number;
        revenue?: number;
    },
) {
    return tx.bundle.update({
        where: { id: bundleId },
        data: metrics,
    });
}

/**
 * Increment bundle views (atomic operation)
 */
export async function incrementBundleViews(bundleId: string) {
    return prisma.bundle.update({
        where: { id: bundleId },
        data: {
            views: { increment: 1 },
        },
    });
}

/**
 * Increment bundle conversions (atomic operation)
 */
export async function incrementBundleConversions(
    bundleId: string,
    revenue: number,
) {
    return prisma.bundle.update({
        where: { id: bundleId },
        data: {
            conversions: { increment: 1 },
            revenue: { increment: revenue },
        },
    });
}

// ==========================================
// DELETE Operations (Simple)
// ==========================================

/**
 * Delete bundle by ID (within transaction)
 */
export async function deleteBundleById(
    tx: Prisma.TransactionClient,
    id: string,
) {
    return tx.bundle.delete({
        where: { id },
    });
}

/**
 * Delete multiple bundles (within transaction)
 */
export async function deleteBundlesByIds(
    tx: Prisma.TransactionClient,
    bundleIds: string[],
) {
    return tx.bundle.deleteMany({
        where: { id: { in: bundleIds } },
    });
}

/**
 * Delete bundle by ID with ownership verification (within transaction)
 */
export async function deleteBundleByIdWithOwnership(
    tx: Prisma.TransactionClient,
    id: string,
    shop: string,
) {
    // Verify ownership
    const bundle = await verifyBundleOwnershipTx(tx, id, shop);

    // Delete bundle
    await tx.bundle.delete({
        where: { id },
    });

    return bundle;
}

/**
 * Delete multiple bundles with ownership verification (within transaction)
 */
export async function deleteBundlesByIdsWithOwnership(
    tx: Prisma.TransactionClient,
    ids: string[],
    shop: string,
) {
    // Verify all bundles belong to the shop
    const existingBundles = await verifyMultipleBundlesOwnershipTx(
        tx,
        ids,
        shop,
    );

    // Delete bundles
    await tx.bundle.deleteMany({
        where: { id: { in: ids } },
    });

    return existingBundles;
}

// ==========================================
// DELETE Operations (Relations)
// ==========================================

/**
 * Delete bundle products (within transaction)
 */
export async function deleteBundleProducts(
    tx: Prisma.TransactionClient,
    bundleId: string,
) {
    return tx.bundleProduct.deleteMany({
        where: { bundleId },
    });
}

/**
 * Delete bundle product groups (within transaction)
 */
export async function deleteBundleProductGroups(
    tx: Prisma.TransactionClient,
    bundleId: string,
) {
    return tx.bundleProductGroup.deleteMany({
        where: { bundleId },
    });
}

/**
 * Delete bundle settings (within transaction)
 */
export async function deleteBundleSettings(
    tx: Prisma.TransactionClient,
    bundleId: string,
) {
    return tx.bundleSettings.deleteMany({
        where: { bundleId },
    });
}

/**
 * Delete bundle analytics (within transaction)
 */
export async function deleteBundleAnalytics(
    tx: Prisma.TransactionClient,
    bundleId: string,
) {
    return tx.bundleAnalytics.deleteMany({
        where: { bundleId },
    });
}

/**
 * Delete all bundle related records (within transaction)
 */
export async function deleteAllBundleRelations(
    tx: Prisma.TransactionClient,
    bundleId: string,
) {
    await Promise.all([
        deleteBundleProducts(tx, bundleId),
        deleteBundleProductGroups(tx, bundleId),
        deleteBundleSettings(tx, bundleId),
        tx.automationBundle.deleteMany({ where: { bundleId } }),
    ]);
}

/**
 * Delete all relations for multiple bundles (within transaction)
 */
export async function deleteAllBundleRelationsForMany(
    tx: Prisma.TransactionClient,
    bundleIds: string[],
) {
    await Promise.all([
        tx.bundleProduct.deleteMany({ where: { bundleId: { in: bundleIds } } }),
        tx.bundleProductGroup.deleteMany({
            where: { bundleId: { in: bundleIds } },
        }),
        tx.bundleSettings.deleteMany({
            where: { bundleId: { in: bundleIds } },
        }),
        tx.automationBundle.deleteMany({
            where: { bundleId: { in: bundleIds } },
        }),
    ]);
}

// ==========================================
// COMPLEX Operations (Transaction Management)
// These manage their own transactions - complete atomic operations
// ==========================================

/**
 * Delete a bundle with all related records (manages transaction)
 */
export async function deleteBundleWithRelations(
    bundleId: string,
    shop: string,
): Promise<DeleteBundleResult> {
    return prisma.$transaction(
        async (tx) => {
            const existingBundle = await verifyBundleOwnershipTx(
                tx,
                bundleId,
                shop,
            );

            await deleteAllBundleRelations(tx, bundleId);

            const timestamp = Date.now();
            await tx.bundle.update({
                where: { id: bundleId },
                data: {
                    status: "DELETED",
                    deletedAt: new Date(),
                    name: `${existingBundle.name} [deleted-${timestamp}]`,
                    isPublished: false,
                },
            });

            return {
                id: existingBundle.id,
                name: existingBundle.name,
            };
        },
        {
            timeout: 10000,
        },
    );
}

/**
 * Delete multiple bundles with relations (manages transaction)
 */
export async function deleteBundlesWithRelations(
    bundleIds: string[],
    shop: string,
): Promise<DeleteBundleResult[]> {
    return prisma.$transaction(
        async (tx) => {
            const bundles = await verifyMultipleBundlesOwnershipTx(
                tx,
                bundleIds,
                shop,
            );

            await deleteAllBundleRelationsForMany(tx, bundleIds);

            const baseTimestamp = Date.now();
            await Promise.all(
                bundles.map((bundle, i) =>
                    tx.bundle.update({
                        where: { id: bundle.id },
                        data: {
                            status: "DELETED",
                            deletedAt: new Date(),
                            name: `${bundle.name} [deleted-${baseTimestamp + i}]`,
                            isPublished: false,
                        },
                    }),
                ),
            );

            return bundles;
        },
        {
            timeout: 15000,
        },
    );
}

// ==========================================
// UTILITY Operations
// ==========================================

/**
 * Generate unique bundle name for duplication
 */
export async function generateUniqueBundleName(
    shop: string,
    baseName: string,
): Promise<string> {
    let counter = 1;
    let newName = `${baseName} (Copy)`;

    // Keep trying until we find a unique name
    while (true) {
        const existing = await prisma.bundle.findFirst({
            where: { shop, name: newName },
            select: { id: true },
        });

        if (!existing) {
            return newName;
        }

        counter++;
        newName = `${baseName} (Copy ${counter})`;

        // Safety check: prevent infinite loop
        if (counter > 1000) {
            throw new Error("Unable to generate unique bundle name");
        }
    }
}

/**
 * Publish bundle (set to ACTIVE with timestamp)
 */
export async function publishBundle(bundleId: string, shop: string) {
    await verifyBundleOwnership(bundleId, shop);

    return prisma.bundle.update({
        where: { id: bundleId },
        data: {
            status: "ACTIVE",
            isPublished: true,
            publishedAt: new Date(),
        },
    });
}

/**
 * Unpublish bundle (set to DRAFT)
 */
export async function unpublishBundle(bundleId: string, shop: string) {
    await verifyBundleOwnership(bundleId, shop);

    return prisma.bundle.update({
        where: { id: bundleId },
        data: {
            status: "DRAFT",
            isPublished: false,
        },
    });
}

/**
 * Clear mainProductId/mainVariantId for all bundles referencing a deleted Shopify product.
 */
export async function clearMainProductByGid(
    shop: string,
    mainProductId: string,
): Promise<number> {
    const result = await prisma.bundle.updateMany({
        where: { shop, mainProductId },
        data: { mainProductId: null, mainVariantId: null },
    });
    return result.count;
}
