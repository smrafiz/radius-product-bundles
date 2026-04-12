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
 * Find app settings + shop metadata in a single query.
 * Avoids the double-fetch pattern of findSettingsByShopDomain + findShopByDomain.
 */
export async function findSettingsWithShop(
    shopDomain: string,
    tx?: Prisma.TransactionClient,
) {
    const client = tx || prisma;

    const shop = await client.shop.findUnique({
        where: { domain: shopDomain },
        select: {
            id: true,
            primaryLocale: true,
            appSettings: true,
        },
    });

    if (!shop) return null;

    return {
        shopId: shop.id,
        primaryLocale: shop.primaryLocale,
        appSettings: shop.appSettings,
    };
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
