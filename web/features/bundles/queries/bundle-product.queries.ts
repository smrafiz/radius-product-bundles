import { Prisma } from "@prisma/client";
import prisma from "@/lib/db/prisma-connect";

export const bundleProductQueries = {
    /*
    * Create many products in a transaction
    */
    createMany: async (
        tx: Prisma.TransactionClient,
        bundleId: string,
        products: Prisma.BundleProductCreateManyInput[],
    ) =>
        await tx.bundleProduct.createMany({
            data: products.map(({ bundleId: _, ...product }) => ({
                ...product,
                bundleId,
            })),
        }),

    /*
     * Create from validated data (ordered, typed, role-safe)
     */
    createManyFromValidatedData: async (
        bundleId: string,
        products: Array<{
            productId: string;
            variantId?: string | null;
            quantity: number;
            role?: "INCLUDED" | "OPTIONAL";
            groupId?: string | null;
            customPrice?: number | null;
            discountPercent?: number | null;
        }>,
    ) => {
        if (!products?.length) return Promise.resolve(null);

        return await prisma.bundleProduct.createMany({
            data: products.map((product, index) => ({
                bundleId,
                productId: product.productId,
                variantId: product.variantId,
                quantity: product.quantity,
                displayOrder: index,
                role: product.role ?? "INCLUDED",
                groupId: product.groupId,
                customPrice: product.customPrice,
                discountPercent: product.discountPercent,
                isRequired: (product.role ?? "INCLUDED") !== "OPTIONAL",
            })),
        });
    },

    /*
     * Fetch all products for a bundle
     */
    findByBundle: async (bundleId: string) =>
        await prisma.bundleProduct.findMany({
            where: { bundleId },
            orderBy: { displayOrder: "asc" },
        }),

    /*
     * Fetch by bundle and role
     */
    findByBundleWithRole: async (bundleId: string, role: "INCLUDED" | "OPTIONAL") =>
        await prisma.bundleProduct.findMany({
            where: { bundleId, role },
            orderBy: { displayOrder: "asc" },
        }),

    /*
     * Find bundles containing a product
     */
    findByProduct: async (productId: string) =>
        await prisma.bundleProduct.findMany({
            where: { productId },
            include: {
                bundle: {
                    select: {
                        id: true,
                        name: true,
                        status: true,
                        shop: true,
                    },
                },
            },
        }),

    /*
     * Update a product by id
     */
    updateById: async (id: string, data: Prisma.BundleProductUpdateInput) =>
        await prisma.bundleProduct.update({ where: { id }, data }),

    /*
     * Update only quantity
     */
    updateQuantity: async (id: string, quantity: number) =>
        await prisma.bundleProduct.update({
            where: { id },
            data: { quantity },
        }),

    /*
     * Bulk update display order
     */
    updateDisplayOrder: async (
        updates: Array<{ id: string; displayOrder: number }>,
        tx?: Prisma.TransactionClient
    ) => {
        if (tx) {
            return Promise.all(
                updates.map(({ id, displayOrder }) =>
                    tx.bundleProduct.update({
                        where: { id },
                        data: { displayOrder },
                    })
                )
            );
        }

        return prisma.$transaction(
            updates.map(({ id, displayOrder }) =>
                prisma.bundleProduct.update({
                    where: { id },
                    data: { displayOrder },
                })
            )
        );
    },

    /*
     * Delete all bundle products in a transaction
     */
    deleteByBundle: async (tx: Prisma.TransactionClient, bundleId: string) =>
        await tx.bundleProduct.deleteMany({ where: { bundleId } }),

    /*
     * Delete single product by ID
     */
    deleteById: async (id: string) => await prisma.bundleProduct.delete({ where: { id } }),

    /*
     * Delete specific product from a bundle
     */
    deleteByProduct: async (bundleId: string, productId: string) =>
        await prisma.bundleProduct.deleteMany({
            where: { bundleId, productId },
        }),

    /*
     * Delete all products from multiple bundles
     */
    deleteByBundles: async (tx: Prisma.TransactionClient, bundleIds: string[]) =>
        await tx.bundleProduct.deleteMany({
            where: { bundleId: { in: bundleIds } },
        }),
} as const;
