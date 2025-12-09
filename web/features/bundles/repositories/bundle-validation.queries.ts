/**
 * Bundle Validation Queries - Data Access Layer
 */

import { Prisma } from "@/prisma/generated/client";
import { BundleOwnershipCheck } from "@/features/bundles";
import { prisma } from "@/shared/repositories/prisma-connect";

/**
 * Verify bundle ownership (standalone)
 */
export async function verifyBundleOwnership(
    bundleId: string,
    shop: string,
): Promise<BundleOwnershipCheck> {
    const bundle = await prisma.bundle.findUnique({
        where: { id: bundleId },
        select: { id: true, name: true, shop: true },
    });

    if (!bundle) {
        throw new Error("Bundle not found");
    }

    if (bundle.shop !== shop) {
        throw new Error("You don't have permission to access this bundle");
    }

    return bundle;
}

/**
 * Verify bundle ownership (within transaction)
 */
export async function verifyBundleOwnershipTx(
    tx: Prisma.TransactionClient,
    bundleId: string,
    shop: string,
): Promise<BundleOwnershipCheck> {
    const bundle = await tx.bundle.findUnique({
        where: { id: bundleId },
        select: { id: true, name: true, shop: true },
    });

    if (!bundle) {
        throw new Error("Bundle not found");
    }

    if (bundle.shop !== shop) {
        throw new Error("You don't have permission to access this bundle");
    }

    return bundle;
}

/**
 * Verify multiple bundles ownership (standalone)
 */
export async function verifyMultipleBundlesOwnership(
    bundleIds: string[],
    shop: string,
): Promise<BundleOwnershipCheck[]> {
    const bundles = await prisma.bundle.findMany({
        where: {
            id: { in: bundleIds },
            shop,
        },
        select: { id: true, name: true, shop: true },
    });

    if (bundles.length !== bundleIds.length) {
        throw new Error(
            "Some bundles not found or you don't have permission to access them",
        );
    }

    return bundles;
}

/**
 * Verify multiple bundles ownership (within transaction)
 */
export async function verifyMultipleBundlesOwnershipTx(
    tx: Prisma.TransactionClient,
    bundleIds: string[],
    shop: string,
): Promise<BundleOwnershipCheck[]> {
    const bundles = await tx.bundle.findMany({
        where: {
            id: { in: bundleIds },
            shop,
        },
        select: { id: true, name: true, shop: true },
    });

    if (bundles.length !== bundleIds.length) {
        throw new Error(
            "Some bundles not found or you don't have permission to access them",
        );
    }

    return bundles;
}

/**
 * Check if bundle exists and is owned (returns boolean instead of throwing)
 *
 * @param bundleId - Bundle ID
 * @param shop - Shop domain
 * @returns true if bundle exists and is owned, false otherwise
 */
export async function isBundleOwnedByShop(
    bundleId: string,
    shop: string,
): Promise<boolean> {
    const bundle = await prisma.bundle.findFirst({
        where: { id: bundleId, shop },
        select: { id: true },
    });

    return bundle !== null;
}
