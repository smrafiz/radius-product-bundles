"use server";

/*
 * Settings Queries - Data Access Layer
 */

import { prisma } from "@/shared/repositories";
import { Prisma } from "@/prisma/generated/client";

/**
 * Create app settings for a shop
 */
export async function createSettings(
    data: Prisma.AppSettingsCreateInput,
    tx?: Prisma.TransactionClient,
) {
    const client = tx || prisma;
    return client.appSettings.create({
        data,
    });
}

// ==========================================
// UPDATE Operations
// ==========================================

/**
 * Update app settings by shop ID
 */
export async function updateSettingsByShopId(
    shopId: string,
    data: Prisma.AppSettingsUpdateInput,
    tx?: Prisma.TransactionClient,
) {
    const client = tx || prisma;
    return client.appSettings.update({
        where: { shopId },
        data: {
            ...data,
            updatedAt: new Date(),
        },
    });
}

/**
 * Upsert app settings (create if not exists, update if exists)
 */
export async function upsertSettings(
    shopId: string,
    data: Omit<Prisma.AppSettingsCreateInput, "shop">,
    tx?: Prisma.TransactionClient,
) {
    const client = tx || prisma;

    return client.appSettings.upsert({
        where: { shopId },
        create: {
            ...data,
            shop: { connect: { id: shopId } },
        },
        update: {
            ...data,
            updatedAt: new Date(),
        },
    });
}

// ==========================================
// DELETE Operations
// ==========================================

/**
 * Delete app settings by shop ID
 */
export async function deleteSettingsByShopId(
    shopId: string,
    tx?: Prisma.TransactionClient,
) {
    const client = tx || prisma;
    return client.appSettings.delete({
        where: { shopId },
    });
}
