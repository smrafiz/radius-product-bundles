/**
 * Bundle Read Service - Business Logic Layer
 */

import {
    BundlesListResult,
    BundleStatus,
    extractProductIds,
    getBundlesAction,
    GetBundlesInput,
    PaginationResult,
    transformBundle,
    transformBundles,
} from "@/features/bundles";
import { fetchProductsFromShopify } from "@/lib";
import { countBundlesByShop, findBundleByIdWithAllRelations, findBundlesByShop, } from "../repositories";

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
    return await getBundlesAction(sessionToken, 1, 100, { status: statusFilter }).then((result) => result.data);
}

/**
 * Get active bundles
 */
export async function getActiveBundles(
    sessionToken: string,
): Promise<any[]> {
    return await getBundlesByStatus(["ACTIVE"], sessionToken);
}
