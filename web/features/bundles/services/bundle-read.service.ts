/**
 * Bundle Read Service - Business Logic Layer
 */

import {
    checkNameConflict,
    countBundlesByShop,
    findBundleByIdWithAllRelations,
    findBundlesByNamePattern,
    findBundlesByShop,
    findBundleStatusById,
} from "../repositories";
import {
    BUNDLE_NAME_PATTERNS,
    BundlesListResult,
    BundleStatus,
    extractNumberFromName,
    extractProductIds,
    generateFallbackName,
    generateNumberedName,
    GetBundlesInput,
    PaginationResult,
} from "@/features/bundles";
import { shuffleArray } from "@/shared";
import { fetchProductsFromShopify } from "@/lib";
import { getBundlesAction } from "@/features/bundles/actions";
import { transformBundle, transformBundles } from "@/features/bundles/services";
import { prisma } from "@/shared/repositories/prisma-connect";

/**
 * Check if a bundle exists and whether it's deleted
 */
export async function checkBundleExists(bundleId: string, shop: string) {
    const bundle = await findBundleStatusById(bundleId, shop);

    return {
        exists: !!bundle,
        isDeleted: bundle?.status === "DELETED",
        type: bundle?.type ?? null,
    };
}

/**
 * Get the bundle list with filters and pagination
 */
export async function getBundlesListService(
    input: GetBundlesInput,
): Promise<BundlesListResult> {
    const { shop, sessionToken, accessToken, pagination, filters } = input;
    const { page, itemsPerPage } = pagination;

    const filtersInput = {
        search: filters?.search,
        status: filters?.status,
        type: filters?.type,
        orderBy: filters?.sortBy || "createdAt",
        orderDirection: filters?.sortDirection || "desc",
    };

    const [bundles, totalCount] = await prisma.$transaction([
        findBundlesByShop(shop, {
            limit: itemsPerPage,
            offset: (page - 1) * itemsPerPage,
            ...filtersInput,
        }),
        countBundlesByShop(shop, {
            search: filters?.search,
            status: filters?.status,
            type: filters?.type,
        }),
    ]);

    const paginationResult: PaginationResult = {
        page,
        itemsPerPage,
        totalItems: totalCount,
        totalPages: Math.ceil(totalCount / itemsPerPage),
    };

    // Early return if no bundles
    if (!bundles.length) {
        return {
            bundles: [],
            pagination: paginationResult,
        };
    }

    const allProductIds = extractProductIds(bundles);

    // Use pre-resolved { shop, accessToken } when available to avoid a second
    // handleSessionToken round-trip inside executeGraphQLQuery.
    const shopifyAuth =
        accessToken ? { shop, accessToken } : sessionToken;

    const { productMap, variantMap } = await fetchProductsFromShopify(
        shopifyAuth,
        allProductIds,
    );

    const transformedBundles = transformBundles(
        bundles,
        productMap,
        variantMap,
    );

    return {
        bundles: transformedBundles,
        pagination: paginationResult,
    };
}

/**
 * Get a single bundle with details
 */
export async function getBundleDetails(input: {
    bundleId: string;
    shop: string;
    sessionToken: string;
    accessToken?: string;
}): Promise<any> {
    const { bundleId, shop, sessionToken, accessToken } = input;

    // Fetch bundle with relations
    const bundle = await findBundleByIdWithAllRelations(bundleId, shop);

    if (!bundle) {
        throw new Error("Bundle not found");
    }

    // Extract product IDs
    const productIds = extractProductIds([bundle]);

    // Use pre-resolved { shop, accessToken } when available to avoid a second
    // handleSessionToken round-trip inside executeGraphQLQuery.
    const shopifyAuth =
        accessToken ? { shop, accessToken } : sessionToken;

    const { productMap, variantMap } = await fetchProductsFromShopify(
        shopifyAuth,
        productIds,
    );

    return transformBundle(bundle, productMap, variantMap);
}

/**
 * Get bundles by status
 */
export async function getBundlesByStatus(
    statusFilter: BundleStatus[],
    sessionToken: string,
): Promise<any[]> {
    return await getBundlesAction(sessionToken, 1, 100, {
        status: statusFilter,
    }).then((result) => result.data);
}

/**
 * Get active bundles
 */
export async function getActiveBundles(sessionToken: string): Promise<any[]> {
    return await getBundlesByStatus(["ACTIVE"], sessionToken);
}

/**
 * Generate unique bundle name based on the bundle type
 */
export async function generateUniqueBundleNameService(
    shop: string,
    bundleType: string,
): Promise<string> {
    const patterns = BUNDLE_NAME_PATTERNS[
        bundleType as keyof typeof BUNDLE_NAME_PATTERNS
    ] || ["Bundle", "Product Pack", "Special Offer"];
    const shuffledPatterns = shuffleArray([...patterns]);

    for (const basePattern of shuffledPatterns) {
        const exists = await checkNameConflict(shop, basePattern);

        if (!exists) {
            return basePattern;
        }

        const uniqueName = await findNextAvailableNumberedName(
            shop,
            basePattern,
        );

        if (uniqueName) {
            return uniqueName;
        }
    }

    return generateFallbackName(shuffledPatterns[0]);
}

/**
 * Find the next available numbered name
 */
async function findNextAvailableNumberedName(
    shop: string,
    baseName: string,
): Promise<string | null> {
    const existingBundles = await findBundlesByNamePattern(shop, baseName);

    if (existingBundles.length === 0) {
        return baseName;
    }

    const numbers = existingBundles
        .map((bundle) => extractNumberFromName(bundle.name))
        .filter((num) => num > 0);

    const maxNumber = numbers.length > 0 ? Math.max(...numbers) : 1;

    const nextNumber = maxNumber + 1;
    const newName = generateNumberedName(baseName, nextNumber);
    const exists = await checkNameConflict(shop, newName);

    if (!exists) {
        return newName;
    }

    for (let i = nextNumber + 1; i < nextNumber + 50; i++) {
        const candidateName = generateNumberedName(baseName, i);
        const candidateExists = await checkNameConflict(shop, candidateName);

        if (!candidateExists) {
            return candidateName;
        }
    }

    return null;
}
