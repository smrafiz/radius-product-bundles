import prisma from "@/shared/repositories/prisma-connect";
import type { ShopStatus } from "@/prisma/generated/enums";

/**
 * Shop Repository
 *
 * Handles shop-related database operations
 */

/**
 * Creates or updates a shop record
 */
export async function upsertShop(
    domain: string,
    data?: Partial<{ status: ShopStatus }>,
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
 * Gets shop with only the fields needed for bundle operation limits
 */
export async function getShopWithLimits(domain: string) {
    return prisma.shop.findUnique({
        where: { domain },
        select: {
            id: true,
            status: true,
            appSettings: {
                select: {
                    maxBundleProducts: true,
                    maxBundlesPerShop: true,
                },
            },
        },
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

export async function isDiscountSetupDone(domain: string): Promise<boolean> {
    const shop = await prisma.shop.findUnique({
        where: { domain },
        select: { discountSetupDone: true },
    });
    return shop?.discountSetupDone === true;
}

export async function markDiscountSetupDone(domain: string): Promise<void> {
    await prisma.shop.upsert({
        where: { domain },
        update: { discountSetupDone: true },
        create: {
            domain,
            discountSetupDone: true,
        },
    });
}

export async function resetSetupFlags(domain: string): Promise<void> {
    await prisma.shop.updateMany({
        where: { domain },
        data: { setupComplete: false, discountSetupDone: false },
    });
}

export async function getShopSubscription(domain: string) {
    return prisma.shopPlan.findUnique({
        where: { shop: domain },
    });
}
