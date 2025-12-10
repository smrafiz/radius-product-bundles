"use server";

/**
 * Product Metafield Operations
 *
 * Manages bundle ID metafields on products for storefront display.
 */

import { executeGraphQLMutation, executeGraphQLQuery } from "@/lib";
import {
    GetProductBundleMetafieldDocument,
    GetProductBundleMetafieldQuery,
    GetProductsBundleMetafieldsDocument,
    GetProductsBundleMetafieldsQuery,
    MetafieldsSetDocument,
    MetafieldsSetMutation,
} from "@/lib/graphql/generated/graphql";

const METAFIELD_NAMESPACE = "radius_bundles";
const METAFIELD_KEY = "bundle_ids";
const METAFIELD_TYPE = "list.single_line_text_field";

interface MetafieldResult {
    success: boolean;
    error?: string;
}

/**
 * Gets existing bundle IDs from a single product's metafield
 */
export async function getProductBundleIds(
    sessionToken: string,
    productId: string,
): Promise<string[]> {
    try {
        const result =
            await executeGraphQLQuery<GetProductBundleMetafieldQuery>({
                query: GetProductBundleMetafieldDocument,
                variables: { productId },
                sessionToken,
            });

        if (result.errors?.length) {
            console.error("[Metafield] Query error:", result.errors);
            return [];
        }

        const value = result.data?.product?.metafield?.value;
        return value ? JSON.parse(value) : [];
    } catch (error) {
        console.error("[Metafield] Error getting bundle IDs:", error);
        return [];
    }
}

/**
 * Gets existing bundle IDs from multiple products' metafields (batch)
 */
export async function getProductsBundleIds(
    sessionToken: string,
    productIds: string[],
): Promise<Map<string, string[]>> {
    const result = new Map<string, string[]>();

    if (productIds.length === 0) {
        return result;
    }

    try {
        const response =
            await executeGraphQLQuery<GetProductsBundleMetafieldsQuery>({
                query: GetProductsBundleMetafieldsDocument,
                variables: { productIds },
                sessionToken,
            });

        if (response.errors?.length) {
            console.error("[Metafield] Batch query error:", response.errors);
            return result;
        }

        const nodes = response.data?.nodes || [];
        for (const node of nodes) {
            if (node && "id" in node && node.id) {
                const metafield = "metafield" in node ? node.metafield : null;
                const value = metafield?.value;
                result.set(node.id, value ? JSON.parse(value) : []);
            }
        }

        return result;
    } catch (error) {
        console.error("[Metafield] Error getting batch bundle IDs:", error);
        return result;
    }
}

/**
 * Adds a bundle ID to multiple products' metafields
 */
export async function addBundleIdToProducts(
    sessionToken: string,
    bundleId: string,
    productIds: string[],
): Promise<MetafieldResult> {
    if (productIds.length === 0) {
        return { success: true };
    }

    console.log(
        `[Metafield] Adding bundle ${bundleId} to ${productIds.length} products`,
    );

    try {
        // Get existing metafields for all products
        const existingMetafields = await getProductsBundleIds(
            sessionToken,
            productIds,
        );

        // Prepare batch update
        const metafieldsToSet = productIds.map((productId) => {
            const existingBundleIds = existingMetafields.get(productId) || [];

            // Add bundle ID if not already present
            if (!existingBundleIds.includes(bundleId)) {
                existingBundleIds.push(bundleId);
            }

            return {
                ownerId: productId,
                namespace: METAFIELD_NAMESPACE,
                key: METAFIELD_KEY,
                type: METAFIELD_TYPE,
                value: JSON.stringify(existingBundleIds),
            };
        });

        // Batch update (Shopify allows up to 25 metafields per mutation)
        const batchSize = 25;
        for (let i = 0; i < metafieldsToSet.length; i += batchSize) {
            const batch = metafieldsToSet.slice(i, i + batchSize);

            const result = await executeGraphQLMutation<MetafieldsSetMutation>({
                query: MetafieldsSetDocument,
                variables: { metafields: batch },
                sessionToken,
            });

            if (result.errors?.length) {
                console.error("[Metafield] Batch set error:", result.errors);
                return { success: false, error: result.errors[0].message };
            }

            const userErrors = result.data?.metafieldsSet?.userErrors || [];
            if (userErrors.length > 0) {
                console.error("[Metafield] User errors:", userErrors);
                return { success: false, error: userErrors[0].message };
            }
        }

        console.log(
            `[Metafield] Added bundle ${bundleId} to ${productIds.length} products`,
        );
        return { success: true };
    } catch (error) {
        console.error("[Metafield] Error adding bundle to products:", error);
        return {
            success: false,
            error: error instanceof Error ? error.message : "Unknown error",
        };
    }
}

/**
 * Removes a bundle ID from multiple products' metafields
 */
export async function removeBundleIdFromProducts(
    sessionToken: string,
    bundleId: string,
    productIds: string[],
): Promise<MetafieldResult> {
    if (productIds.length === 0) {
        return { success: true };
    }

    console.log(
        `[Metafield] Removing bundle ${bundleId} from ${productIds.length} products`,
    );

    try {
        // Get existing metafields for all products
        const existingMetafields = await getProductsBundleIds(
            sessionToken,
            productIds,
        );

        // Prepare batch update
        const metafieldsToSet = productIds.map((productId) => {
            const existingBundleIds = existingMetafields.get(productId) || [];

            // Remove bundle ID
            const updatedBundleIds = existingBundleIds.filter(
                (id) => id !== bundleId,
            );

            return {
                ownerId: productId,
                namespace: METAFIELD_NAMESPACE,
                key: METAFIELD_KEY,
                type: METAFIELD_TYPE,
                value: JSON.stringify(updatedBundleIds),
            };
        });

        // Batch update
        const batchSize = 25;
        for (let i = 0; i < metafieldsToSet.length; i += batchSize) {
            const batch = metafieldsToSet.slice(i, i + batchSize);

            const result = await executeGraphQLMutation<MetafieldsSetMutation>({
                query: MetafieldsSetDocument,
                variables: { metafields: batch },
                sessionToken,
            });

            if (result.errors?.length) {
                console.error("[Metafield] Batch remove error:", result.errors);
                return { success: false, error: result.errors[0].message };
            }

            const userErrors = result.data?.metafieldsSet?.userErrors || [];
            if (userErrors.length > 0) {
                console.error("[Metafield] User errors:", userErrors);
                return { success: false, error: userErrors[0].message };
            }
        }

        console.log(
            `[Metafield] Removed bundle ${bundleId} from ${productIds.length} products`,
        );
        return { success: true };
    } catch (error) {
        console.error(
            "[Metafield] Error removing bundle from products:",
            error,
        );
        return {
            success: false,
            error: error instanceof Error ? error.message : "Unknown error",
        };
    }
}

/**
 * Syncs bundle ID metafields when bundle products are updated
 * Handles added and removed products
 */
export async function syncBundleProductMetafields(
    sessionToken: string,
    bundleId: string,
    oldProductIds: string[],
    newProductIds: string[],
): Promise<MetafieldResult> {
    // Find added and removed products
    const addedProducts = newProductIds.filter(
        (id) => !oldProductIds.includes(id),
    );
    const removedProducts = oldProductIds.filter(
        (id) => !newProductIds.includes(id),
    );

    console.log(`[Metafield] Syncing bundle ${bundleId}:`, {
        added: addedProducts.length,
        removed: removedProducts.length,
    });

    // Add bundle ID to new products
    if (addedProducts.length > 0) {
        const addResult = await addBundleIdToProducts(
            sessionToken,
            bundleId,
            addedProducts,
        );
        if (!addResult.success) {
            return addResult;
        }
    }

    // Remove bundle ID from removed products
    if (removedProducts.length > 0) {
        const removeResult = await removeBundleIdFromProducts(
            sessionToken,
            bundleId,
            removedProducts,
        );
        if (!removeResult.success) {
            return removeResult;
        }
    }

    return { success: true };
}
