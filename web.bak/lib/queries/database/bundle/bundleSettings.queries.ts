import prisma from "@/lib/db/prisma-connect";

export const bundleSettingsQueries = {
    async create(data: any) {
        return await prisma.bundleSettings.create({
            data,
        });
    },

    async findByBundle(bundleId: string) {
        return await prisma.bundleSettings.findUnique({
            where: { bundleId },
        });
    },

    async updateByBundle(bundleId: string, data: any) {
        return await prisma.bundleSettings.upsert({
            where: { bundleId },
            update: data,
            create: { bundleId, ...data },
        });
    },

    async findByLayout(shop: string, layout: string) {
        return await prisma.bundle.findMany({
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
