import prisma from "@/shared/repositories/prisma-connect";

/**
 * Creates or updates a shop record
 */
export async function upsertShop(
    domain: string,
    data?: Partial<{ plan: string; trialEndsAt: Date }>,
) {
    return prisma.shop.upsert({
        where: { domain },
        create: { domain, ...data },
        update: { ...data },
    });
}

/**
 * Gets a shop with app settings
 */
export async function getShop(domain: string) {
    return prisma.shop.findUnique({
        where: { domain },
        include: { appSettings: true },
    });
}

/**
 * Gets shop status
 */
export async function getShopStatus(domain: string) {
    const shop = await prisma.shop.findUnique({
        where: { domain },
        select: { status: true },
    });
    return shop?.status ?? null;
}

/**
 * Checks if metafield setup is complete for a shop
 */
export async function isMetafieldSetupDone(domain: string): Promise<boolean> {
    const shop = await prisma.shop.findUnique({
        where: { domain },
        select: { metafieldSetupDone: true },
    });
    return shop?.metafieldSetupDone === true;
}

/**
 * Marks metafield setup as complete for a shop
 */
export async function markMetafieldSetupDone(domain: string): Promise<void> {
    await prisma.shop.upsert({
        where: { domain },
        update: { metafieldSetupDone: true },
        create: {
            domain,
            metafieldSetupDone: true,
        },
    });
}