import {
    bundleQueries,
    BundleStatus,
    CreateBundleInput,
    DeleteBundleResult,
    UpdateBundleInput,
} from "@/features/bundles";
import { Prisma } from "@prisma/client";
import { generateBundleId } from "@/shared";
import prisma from "@/lib/db/prisma-connect";

/*
 * Bundle Mutations - Database Layer
 */
export const bundleMutations = {
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

    /*
     * Delete a bundle with all related records (transaction)
     */
    async deleteBundleWithRelations(
        bundleId: string,
        shop: string
    ): Promise<DeleteBundleResult> {
        return await prisma.$transaction(
            async (tx) => {
                const existingBundle = await bundleQueries.verifyBundleOwnership(
                    bundleId,
                    shop
                );

                if (!existingBundle || existingBundle.shop !== shop) {
                    throw new Error(
                        "Bundle not found or you don't have permission to delete it"
                    );
                }

                await Promise.all([
                    tx.bundleProduct.deleteMany({ where: { bundleId } }),
                    tx.bundleProductGroup.deleteMany({ where: { bundleId } }),
                    tx.bundleSettings.deleteMany({ where: { bundleId } }),
                    tx.bundleAnalytics.deleteMany({ where: { bundleId } }),
                ]);

                await tx.bundle.delete({ where: { id: bundleId } });

                return {
                    id: existingBundle.id,
                    name: existingBundle.name,
                };
            },
            {
                timeout: 10000,
            }
        );
    },

    /**
     * Delete multiple bundles with relations (bulk delete)
     */
    async deleteBundlesWithRelations(
        bundleIds: string[],
        shop: string
    ): Promise<DeleteBundleResult[]> {
        return await prisma.$transaction(
            async (tx) => {
                const bundles = await tx.bundle.findMany({
                    where: {
                        id: { in: bundleIds },
                        shop,
                    },
                    select: { id: true, name: true },
                });

                if (bundles.length !== bundleIds.length) {
                    throw new Error("Some bundles not found or not owned by you");
                }

                // Delete all related records for all bundles in parallel
                await Promise.all([
                    tx.bundleProduct.deleteMany({
                        where: { bundleId: { in: bundleIds } },
                    }),
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

                // Delete all bundles
                await tx.bundle.deleteMany({
                    where: { id: { in: bundleIds } },
                });

                return bundles;
            },
            {
                timeout: 15000,
            }
        );
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
}