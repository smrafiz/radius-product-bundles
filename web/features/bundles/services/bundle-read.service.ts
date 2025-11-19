/**
 * Bundle Read Service - Business Logic Layer
 */

import {
    countBundlesByShop,
    findBundleByIdWithAllRelations,
    findBundlesByShop,
} from "../repositories";
import {
    BUNDLE_NAME_PATTERNS,
    BundlesListResult,
    BundleStatus,
    checkNameConflict,
    extractNumberFromName,
    extractProductIds,
    findBundlesByNamePattern,
    generateFallbackName,
    generateNumberedName,
    getBundlesAction,
    GetBundlesInput,
    PaginationResult,
    transformBundle,
    transformBundles,
} from "@/features/bundles";
import { shuffleArray } from "@/shared";
import { fetchProductsFromShopify } from "@/lib";

/**
 * Get the bundle list with filters and pagination
 */
export async function getBundlesListService(
    input: GetBundlesInput,
): Promise<BundlesListResult> {
    const { shop, sessionToken, pagination, filters } = input;
    const { page, itemsPerPage } = pagination;

    const bundles = await findBundlesByShop(shop, {
        limit: itemsPerPage,
        offset: (page - 1) * itemsPerPage,
        search: filters?.search,
        status: filters?.status,
        type: filters?.type,
        orderBy: filters?.sortBy || "createdAt",
        orderDirection: filters?.sortDirection || "desc",
    });

    const totalCount = await countBundlesByShop(shop, {
        search: filters?.search,
        status: filters?.status,
        type: filters?.type,
    });

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

    const { productMap, variantMap } = await fetchProductsFromShopify(
        sessionToken,
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
}): Promise<any> {
    const { bundleId, shop, sessionToken } = input;

    // Fetch bundle with relations
    const bundle = await findBundleByIdWithAllRelations(bundleId, shop);

    if (!bundle) {
        throw new Error("Bundle not found");
    }

    // Extract product IDs
    const productIds = extractProductIds([bundle]);

    // Fetch product data from Shopify
    const { productMap, variantMap } = await fetchProductsFromShopify(
        sessionToken,
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
    const patterns = BUNDLE_NAME_PATTERNS[bundleType as keyof typeof BUNDLE_NAME_PATTERNS] || [
        "Bundle",
        "Product Pack",
        "Special Offer",
    ];
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