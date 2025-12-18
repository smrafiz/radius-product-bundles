"use server";

/**
 * Product & Shop Metafield Operations
 *
 * Manages bundle ID metafields on products for storefront display.
 * Manages active bundles metafield on discount AND shop for validation.
 */

import { executeGraphQLMutation, executeGraphQLQuery } from "@/lib";
import {
    GetProductBundleMetafieldDocument,
    GetProductBundleMetafieldQuery,
    GetProductsBundleMetafieldsDocument,
    GetProductsBundleMetafieldsQuery,
    MetafieldsSetDocument,
    MetafieldsSetMutation,
    GetBundleDiscountIdDocument,
    GetBundleDiscountIdQuery,
    GetShopIdDocument,
    GetShopIdQuery,
} from "@/lib/graphql/generated/graphql";
import {
    findActiveBundlesByShop,
    findAppSettingsByShop,
} from "@/features/bundles/repositories";
import { buildGlobalSettingsMetafieldValue } from "@/lib/graphql/operations/settings-metafield.operations";

const METAFIELD_NAMESPACE = "radius_bundles";
const METAFIELD_KEY = "bundle_ids";
const METAFIELD_TYPE = "list.single_line_text_field";

// Active bundles metafield constants
const ACTIVE_BUNDLES_KEY = "active_bundles";
const JSON_TYPE = "json";
const BUNDLE_DISCOUNT_TITLE = "Radius Bundle Discounts";

interface MetafieldResult {
    success: boolean;
    error?: string;
}

interface SyncResult extends MetafieldResult {
    bundleCount?: number;
}

// ============================================================================
// PRODUCT METAFIELD FUNCTIONS (existing)
// ============================================================================

/**
 * Gets existing bundle IDs from a single product's metafield.
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
 * Gets existing bundle IDs from multiple products' metafields (batch).
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
 * Adds a bundle ID to multiple products' metafields.
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
        const existingMetafields = await getProductsBundleIds(
            sessionToken,
            productIds,
        );

        const metafieldsToSet = productIds.map((productId) => {
            const existingBundleIds = existingMetafields.get(productId) || [];

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
 * Removes a bundle ID from multiple products' metafields.
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
        const existingMetafields = await getProductsBundleIds(
            sessionToken,
            productIds,
        );

        const metafieldsToSet = productIds.map((productId) => {
            const existingBundleIds = existingMetafields.get(productId) || [];
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
 * Syncs bundle ID metafields when bundle products are updated.
 */
export async function syncBundleProductMetafields(
    sessionToken: string,
    bundleId: string,
    oldProductIds: string[],
    newProductIds: string[],
): Promise<MetafieldResult> {
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

// ============================================================================
// ACTIVE BUNDLES METAFIELD FUNCTIONS (for discount validation)
// ============================================================================

/**
 * Bundle configuration stored in metafield.
 * This is the authoritative source for discount calculations.
 */
interface MetafieldBundleConfig {
    status: string;
    discountType: string;
    discountValue: number;
    freeShipping: boolean;
    minOrderValue: number;
    maxDiscountAmount: number;
    discountApplication: string;
    discountedProductIds: string[];
}

/**
 * Gets the discount node ID for the bundle discount.
 */
async function getBundleDiscountId(
    sessionToken: string,
): Promise<string | null> {
    try {
        const result = await executeGraphQLQuery<GetBundleDiscountIdQuery>({
            query: GetBundleDiscountIdDocument,
            variables: {
                query: `title:"${BUNDLE_DISCOUNT_TITLE}"`,
            },
            sessionToken,
        });

        return result.data?.discountNodes?.edges?.[0]?.node?.id || null;
    } catch (error) {
        console.error("[Metafield] Failed to get discount ID:", error);
        return null;
    }
}

/**
 * Gets the shop ID for metafield ownership.
 */
async function getShopId(sessionToken: string): Promise<string | null> {
    try {
        const result = await executeGraphQLQuery<GetShopIdQuery>({
            query: GetShopIdDocument,
            variables: {},
            sessionToken,
        });

        return result.data?.shop?.id || null;
    } catch (error) {
        console.error("[Metafield] Failed to get shop ID:", error);
        return null;
    }
}

/**
 * Builds the metafield value from active bundles.
 */
function buildActiveBundlesMetafieldValue(
    bundles: Awaited<ReturnType<typeof findActiveBundlesByShop>>,
): string {
    const bundleMap: Record<string, MetafieldBundleConfig> = {};

    for (const bundle of bundles) {
        bundleMap[bundle.id] = {
            status: bundle.status,
            discountType: bundle.discountType || "PERCENTAGE",
            discountValue: bundle.discountValue || 0,
            freeShipping: bundle.freeShipping || false,
            minOrderValue: bundle.minOrderValue || 0,
            maxDiscountAmount: bundle.maxDiscountAmount || 0,
            discountApplication: bundle.discountApplication || "bundle",
            discountedProductIds: bundle.discountedProductIds || [],
        };
    }

    return JSON.stringify(bundleMap);
}

/**
 * Syncs all active bundles to BOTH discount metafield AND shop metafield.
 *
 * - Discount metafield: Used by Rust function for checkout validation
 * - Shop metafield: Used by Liquid/storefront for cart banner validation
 *
 * @param sessionToken - Session token for authentication.
 * @param shop - Shop domain.
 * @returns Result indicating success or failure.
 */
export async function syncActiveBundlesToMetafield(
    sessionToken: string,
    shop: string,
): Promise<SyncResult> {
    try {
        // Get discount ID (for Rust function)
        const discountId = await getBundleDiscountId(sessionToken);

        if (!discountId) {
            console.error("[Metafield] Bundle discount not found");
            return {
                success: false,
                error: "Bundle discount not found. Please reinstall the app.",
            };
        }

        // Get shop ID (for Liquid/storefront)
        const shopId = await getShopId(sessionToken);

        if (!shopId) {
            console.error("[Metafield] Shop ID not found");
            return {
                success: false,
                error: "Failed to get shop ID.",
            };
        }

        // Fetch all active bundles from database
        const activeBundles = await findActiveBundlesByShop(shop);

        // Build metafield value
        const metafieldValue = buildActiveBundlesMetafieldValue(activeBundles);

        // Set BOTH metafields in a single mutation
        const result = await executeGraphQLMutation<MetafieldsSetMutation>({
            query: MetafieldsSetDocument,
            variables: {
                metafields: [
                    // For Rust discount function (on Discount node)
                    {
                        ownerId: discountId,
                        namespace: METAFIELD_NAMESPACE,
                        key: ACTIVE_BUNDLES_KEY,
                        type: JSON_TYPE,
                        value: metafieldValue,
                    },
                    // For Liquid/storefront (on Shop)
                    {
                        ownerId: shopId,
                        namespace: METAFIELD_NAMESPACE,
                        key: ACTIVE_BUNDLES_KEY,
                        type: JSON_TYPE,
                        value: metafieldValue,
                    },
                ],
            },
            sessionToken,
        });

        if (result.errors?.length) {
            console.error("[Metafield] Sync error:", result.errors);
            return {
                success: false,
                error: result.errors[0].message,
            };
        }

        const userErrors = result.data?.metafieldsSet?.userErrors || [];
        if (userErrors.length > 0) {
            console.error("[Metafield] Sync user errors:", userErrors);
            return {
                success: false,
                error: userErrors[0].message ?? "Unknown error",
            };
        }

        console.log(
            `[Metafield] Synced ${activeBundles.length} active bundles to discount + shop metafields for ${shop}`,
        );

        return {
            success: true,
            bundleCount: activeBundles.length,
        };
    } catch (error) {
        console.error("[Metafield] Error syncing active bundles:", error);
        return {
            success: false,
            error: error instanceof Error ? error.message : "Unknown error",
        };
    }
}

/**
 * Syncs global settings to shop metafield.
 */
export async function syncGlobalSettingsToMetafield(
    sessionToken: string,
    shop: string,
): Promise<SyncResult> {
    try {
        const shopId = await getShopId(sessionToken);
        if (!shopId) {
            return { success: false, error: "Shop ID not found" };
        }

        // Fetch global settings from database
        const globalSettings = await findAppSettingsByShop(shop);

        if (!globalSettings) {
            return { success: true, message: "No global settings to sync" };
        }

        const metafieldValue = buildGlobalSettingsMetafieldValue(globalSettings);

        const result = await executeGraphQLMutation<MetafieldsSetMutation>({
            query: MetafieldsSetDocument,
            variables: {
                metafields: [
                    {
                        ownerId: shopId,
                        namespace: METAFIELD_NAMESPACE,
                        key: "global_settings",
                        type: "json",
                        value: metafieldValue,
                    },
                ],
            },
            sessionToken,
        });

        if (result.data?.metafieldsSet?.userErrors?.length) {
            return {
                success: false,
                error: result.data.metafieldsSet.userErrors[0].message,
            };
        }

        console.log(`[Metafield] Synced global settings for ${shop}`);
        return { success: true };

    } catch (error) {
        console.error("[Metafield] Error syncing global settings:", error);
        return {
            success: false,
            error: error instanceof Error ? error.message : "Unknown error",
        };
    }
}

/**
 * Syncs all data (global settings + active bundles) in one mutation.
 */
export async function syncAllSettingsToMetafields(
    sessionToken: string,
    shop: string,
): Promise<SyncResult> {
    try {
        const [discountId, shopId] = await Promise.all([
            getBundleDiscountId(sessionToken),
            getShopId(sessionToken),
        ]);

        if (!discountId || !shopId) {
            return { success: false, error: "Could not get discount or shop ID" };
        }

        // Fetch all data in parallel
        const [globalSettings, activeBundles] = await Promise.all([
            findAppSettingsByShop(shop),
            findActiveBundlesByShop(shop),
        ]);

        const globalSettingsValue = buildGlobalSettingsMetafieldValue(globalSettings);
        const activeBundlesValue = buildActiveBundlesMetafieldValue(activeBundles);

        // Single mutation for all metafields
        const result = await executeGraphQLMutation<MetafieldsSetMutation>({
            query: MetafieldsSetDocument,
            variables: {
                metafields: [
                    // Global settings (shop)
                    {
                        ownerId: shopId,
                        namespace: METAFIELD_NAMESPACE,
                        key: "global_settings",
                        type: "json",
                        value: globalSettingsValue,
                    },
                    // Active bundles (shop - for Liquid)
                    {
                        ownerId: shopId,
                        namespace: METAFIELD_NAMESPACE,
                        key: "active_bundles",
                        type: "json",
                        value: activeBundlesValue,
                    },
                    // Active bundles (discount - for Rust)
                    {
                        ownerId: discountId,
                        namespace: METAFIELD_NAMESPACE,
                        key: "active_bundles",
                        type: "json",
                        value: activeBundlesValue,
                    },
                ],
            },
            sessionToken,
        });

        if (result.data?.metafieldsSet?.userErrors?.length) {
            return {
                success: false,
                error: result.data.metafieldsSet.userErrors[0].message,
            };
        }

        console.log(`[Metafield] Synced all settings for ${shop}`);
        return { success: true, bundleCount: activeBundles.length };

    } catch (error) {
        console.error("[Metafield] Error syncing all settings:", error);
        return {
            success: false,
            error: error instanceof Error ? error.message : "Unknown error",
        };
    }
}