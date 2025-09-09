import prisma from '@/lib/db/prisma-connect';

export const bundleProductQueries = {
    async createMany(products: any[]) {
        return await prisma.bundleProduct.createMany({
            data: products,
        });
    },

    async createManyFromValidatedData(bundleId: string, products: any[]) {
        if (products.length === 0) return null;

        return await prisma.bundleProduct.createMany({
            data: products.map((product, index) => ({
                bundleId,
                productId: product.productId,
                variantId: product.variantId,
                quantity: product.quantity,
                displayOrder: index,
                role: product.role || "INCLUDED",
                groupId: product.groupId,
                customPrice: product.customPrice,
                discountPercent: product.discountPercent,
                isRequired: product.role !== "OPTIONAL",
            })),
        });
    },

    // Read operations
    async findByBundle(bundleId: string) {
        return await prisma.bundleProduct.findMany({
            where: { bundleId },
            orderBy: { displayOrder: "asc" },
        });
    },

    async findByBundleWithRole(bundleId: string, role: string) {
        return await prisma.bundleProduct.findMany({
            where: {
                bundleId,
                role: role as any
            },
            orderBy: { displayOrder: "asc" },
        });
    },

    async findByProduct(productId: string) {
        return await prisma.bundleProduct.findMany({
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
        });
    },

    // Update operations
    async updateById(id: string, data: any) {
        return await prisma.bundleProduct.update({
            where: { id },
            data,
        });
    },

    async updateQuantity(id: string, quantity: number) {
        return await prisma.bundleProduct.update({
            where: { id },
            data: { quantity },
        });
    },

    async updateDisplayOrder(updates: { id: string; displayOrder: number }[]) {
        const updatePromises = updates.map(({ id, displayOrder }) =>
            prisma.bundleProduct.update({
                where: { id },
                data: { displayOrder },
            })
        );

        return await Promise.all(updatePromises);
    },

    // Delete operations
    async deleteByBundle(bundleId: string) {
        return await prisma.bundleProduct.deleteMany({
            where: { bundleId },
        });
    },

    async deleteById(id: string) {
        return await prisma.bundleProduct.delete({
            where: { id },
        });
    },

    async deleteByProduct(bundleId: string, productId: string) {
        return await prisma.bundleProduct.deleteMany({
            where: {
                bundleId,
                productId
            },
        });
    },
};