import prisma from '@/lib/db/prisma-connect';

export const bundleProductGroupQueries = {
    async createManyFromValidatedData(bundleId: string, productGroups: any[]) {
        if (!productGroups || productGroups.length === 0) return null;

        return await prisma.bundleProductGroup.createMany({
            data: productGroups.map((group, index) => ({
                bundleId,
                name: group.name,
                description: group.description,
                minSelection: group.minSelection,
                maxSelection: group.maxSelection,
                displayOrder: group.displayOrder || index,
            })),
        });
    },

    async createMany(data: any[]) {
        return await prisma.bundleProductGroup.createMany({
            data,
        });
    },

    async findByBundle(bundleId: string) {
        return await prisma.bundleProductGroup.findMany({
            where: { bundleId },
            include: {
                products: {
                    orderBy: { displayOrder: "asc" },
                },
            },
            orderBy: { displayOrder: "asc" },
        });
    },

    async deleteByBundle(bundleId: string) {
        return await prisma.bundleProductGroup.deleteMany({
            where: { bundleId },
        });
    },
};