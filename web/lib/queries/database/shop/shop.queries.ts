import prisma from '@/lib/db/prisma-connect';

export const shopQueries = {
    async getSettings(shop: string) {
        return await prisma.appSettings.findUnique({
            where: { shop },
        });
    },

    async updateSettings(shop: string, data: any) {
        return await prisma.appSettings.upsert({
            where: { shop },
            update: data,
            create: { shop, ...data },
        });
    },

    async getBundleCount(shop: string) {
        return await prisma.bundle.count({
            where: { shop },
        });
    },

    async getActiveBundleCount(shop: string) {
        return await prisma.bundle.count({
            where: { shop, status: "ACTIVE" },
        });
    },
};