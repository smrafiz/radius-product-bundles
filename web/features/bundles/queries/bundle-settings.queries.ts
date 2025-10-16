import { Prisma } from "@prisma/client";
import prisma from "@/lib/db/prisma-connect";

export const bundleSettingsQueries = {
    create: async(data: Prisma.BundleSettingsCreateInput, tx?: Prisma.TransactionClient) => {
        const client = tx ?? prisma;
        return await client.bundleSettings.create({
            data,
        });
    },

    findByBundle: async(bundleId: string, tx?: Prisma.TransactionClient) => {
        const client = tx ?? prisma;
        return await client.bundleSettings.findUnique({
            where: { bundleId },
        });
    },

    updateByBundle: async(bundleId: string, data: Omit<Prisma.BundleSettingsCreateInput, 'bundle'>, tx?: Prisma.TransactionClient) => {
        const client = tx ?? prisma;
        return await client.bundleSettings.upsert({
            where: { bundleId },
            update: data,
            create: {
                ...data,
                bundle: {
                    connect: { id: bundleId }
                }
            },
        });
    },

    findByLayout: async(shop: string, layout: string, tx?: Prisma.TransactionClient) => {
        const client = tx ?? prisma;
        return await client.bundle.findMany({
            where: {
                shop,
                settings: {
                    layout: layout as any,
                },
            },
            include: {
                settings: true,
                bundleProducts: true,
            },
        });
    },
};
