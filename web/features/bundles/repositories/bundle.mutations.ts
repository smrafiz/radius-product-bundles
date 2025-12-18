/**
 * Bundle Mutations - Data Access Layer
 *
 * Write operations.
 */

import {
    BundleStatus,
    CreateBundleInput,
    DeleteBundleResult,
    UpdateBundleInput,
    UpdateBundleInputWithRelations,
} from "@/features/bundles";
import {
    findBundleByIdWithAllRelations,
    verifyBundleOwnership,
    verifyBundleOwnershipTx,
    verifyMultipleBundlesOwnershipTx,
} from "@/features/bundles/repositories";
import { generateBundleId } from "@/shared";
import { prisma } from "@/shared/repositories/prisma-connect";
import { BundleProductRole, Prisma } from "@/prisma/generated/client";

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
            minimumItems: data.minimumItems,
            maximumItems: data.maximumItems,
            discountType: data.discountType,
            discountValue: data.discountValue,
            minOrderValue: data.minOrderValue,
            maxDiscountAmount: data.maxDiscountAmount,
            volumeTiers: data.volumeTiers ?? Prisma.JsonNull,
            allowMixAndMatch: data.allowMixAndMatch,
            mixAndMatchPrice: data.mixAndMatchPrice,
            discountApplication: data.discountApplication ?? "bundle",
            discountedProductIds: data.discountedProductIds ?? [],
            freeShipping: data.freeShipping ?? false,
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
        // Step 1: Create the bundle
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
        await updateBundleById(tx, data.bundleId, {
            name: data.name,
            description: data.description,
            type: data.type,
            status: data.status,
            discountType: data.discountType,
            discountValue: data.discountValue,
            minOrderValue: data.minOrderValue ?? null,
            maxDiscountAmount: data.maxDiscountAmount ?? null,
            startDate: data.startDate ?? null,
            endDate: data.endDate ?? null,
            mainProductId: data.mainProductId ?? null,
            mainVariantId: data.mainVariantId ?? null,
            discountApplication: data.discountApplication || "bundle",
            discountedProductIds: data.discountedProductIds ?? [],
            freeShipping: data.freeShipping ?? false,
        });

        // Delete all existing products
        await deleteBundleProducts(tx, data.bundleId);

        // Create new products (if any)
        if (data.products?.length) {
            await createBundleProducts(tx, data.bundleId, data.products);
        }

        await deleteBundleProductGroups(tx, data.bundleId);

        if (data.productGroups?.length) {
            await createBundleProductGroups(
                tx,
                data.bundleId,
                data.productGroups,
            );
        }

        if (data.settings) {
            const existingSettings = await tx.bundleSettings.findUnique({
                where: { bundleId: data.bundleId },
            });

            if (existingSettings) {
                await updateBundleSettings(tx, data.bundleId, data.settings);
            } else {
                await createBundleSettings(tx, data.bundleId, data.settings);
            }
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
) {
    // Verify ownership first
    await verifyBundleOwnership(id, shop);

    // Update status
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
        deleteBundleAnalytics(tx, bundleId),
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
        tx.bundleAnalytics.deleteMany({
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
            // Step 1: Verify ownership
            const existingBundle = await verifyBundleOwnershipTx(
                tx,
                bundleId,
                shop,
            );

            // Step 2: Delete all related records in parallel
            await deleteAllBundleRelations(tx, bundleId);

            // Step 3: Delete bundle
            await tx.bundle.delete({ where: { id: bundleId } });

            // Step 4: Return deleted bundle info
            return {
                id: existingBundle.id,
                name: existingBundle.name,
            };
        },
        {
            timeout: 10000, // 10-second timeout
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
            // Verify all bundles exist and are owned
            const bundles = await verifyMultipleBundlesOwnershipTx(
                tx,
                bundleIds,
                shop,
            );

            // Delete all related records in parallel
            await deleteAllBundleRelationsForMany(tx, bundleIds);

            // Delete all bundles
            await tx.bundle.deleteMany({
                where: { id: { in: bundleIds } },
            });

            return bundles;
        },
        {
            timeout: 15000, // 15-second timeout
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
