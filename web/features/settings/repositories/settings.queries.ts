"use server";

/**
 * Settings Queries - Data Access Layer
 */

import { Prisma } from "@/prisma/generated/client";
import { prisma } from "@/shared/repositories/prisma-connect";

/**
 * Find app settings by shop ID
 */
export async function findSettingsByShopId(
    shopId: string,
    tx?: Prisma.TransactionClient,
) {
    const client = tx || prisma;
    return client.appSettings.findUnique({
        where: { shopId },
    });
}

/**
 * Find app settings by shop domain
 */
export async function findSettingsByShopDomain(
    shopDomain: string,
    tx?: Prisma.TransactionClient,
) {
    const client = tx || prisma;

    const shop = await client.shop.findUnique({
        where: { domain: shopDomain },
        include: { appSettings: true },
    });

    return shop?.appSettings ?? null;
}

/**
 * Find shop by domain (returns only id for FK lookups)
 */
export async function findShopByDomain(
    domain: string,
    tx?: Prisma.TransactionClient,
) {
    const client = tx || prisma;
    return client.shop.findUnique({
        where: { domain },
        select: { id: true, primaryLocale: true },
    });
}

/**
 * Check if settings exist for a shop
 */
export async function settingsExistForShop(
    shopId: string,
    tx?: Prisma.TransactionClient,
): Promise<boolean> {
    const client = tx || prisma;
    const count = await client.appSettings.count({
        where: { shopId },
    });
    return count > 0;
}
