import { Prisma } from "@prisma/client";
import prisma from "@/lib/db/prisma-connect";
import { BundleProductGroupCreateInput } from "@/features/bundles";

export const bundleProductGroupQueries = {
    createManyFromValidatedData: async (
        bundleId: string,
        productGroups: BundleProductGroupCreateInput[],
    ) => {
        if (!productGroups || productGroups.length === 0) {
            return null;
        }

        return await prisma.bundleProductGroup.createMany({
            data: productGroups.map((group, index) => ({
                bundleId,
                name: group.name,
                description: group.description,
                minSelection: group.minSelection ?? undefined,
                maxSelection: group.maxSelection ?? undefined,
                displayOrder: group.displayOrder || index,
            })),
        });
    },

    createMany: async (
        data: Prisma.BundleProductGroupCreateManyInput[],
        tx?: Prisma.TransactionClient,
    ) => {
        const client = tx ?? prisma;
        return await client.bundleProductGroup.createMany({
            data,
        });
    },

    findByBundle: async (bundleId: string, tx?: Prisma.TransactionClient) => {
        const client = tx ?? prisma;
        return await client.bundleProductGroup.findMany({
            where: { bundleId },
            include: {
                products: {
                    orderBy: { displayOrder: "asc" },
                },
            },
            orderBy: { displayOrder: "asc" },
        });
    },

    deleteByBundle: async (bundleId: string, tx?: Prisma.TransactionClient) => {
        const client = tx ?? prisma;
        return await client.bundleProductGroup.deleteMany({
            where: { bundleId },
        });
    },
};
