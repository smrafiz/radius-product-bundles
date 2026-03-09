"use server";

/**
 * Product & Shop Metafield Operations
 */

import {
    buildGlobalSettingsMetafieldValue,
    fetchProductsFromShopify,
} from "@/lib/graphql/operations";
import {
    GetBundleDiscountIdDocument,
    GetBundleDiscountIdQuery,
    GetProductBundleMetafieldDocument,
    GetProductBundleMetafieldQuery,
    GetProductsBundleMetafieldsDocument,
    GetProductsBundleMetafieldsQuery,
    GetShopIdDocument,
    GetShopIdQuery,
    MetafieldsSetDocument,
    MetafieldsSetMutation,
    UpdateBundleDiscountCombinesWithDocument,
    UpdateBundleDiscountCombinesWithMutation,
} from "@/lib/graphql/generated/graphql";
import {
    BUNDLE_DISCOUNT_TITLE,
    METAFIELD_KEYS,
    METAFIELD_NAMESPACE,
} from "@/shared/constants/metafields.constants";
import { AppSettingsFormData } from "@/features/settings";
import { executeGraphQLMutation, executeGraphQLQuery } from "@/lib";
import { findActiveBundlesByShop } from "@/features/bundles/repositories";
import { findSettingsByShopDomain } from "@/features/settings/repositories";
import { transformFormDataToAppSettings } from "@/features/settings/services/settings.service";
import { calculateDiscountAmount } from "@/features/bundles/utils/calculators/bundle-calculations";

const METAFIELD_KEY = METAFIELD_KEYS["BUNDLE_IDS"];
const METAFIELD_TYPE = "list.single_line_text_field";

// Active bundles metafield constants
const ACTIVE_BUNDLES_KEY = METAFIELD_KEYS["ACTIVE_BUNDLES"];
const JSON_TYPE = "json";
interface MetafieldResult {
    success: boolean;
    error?: string;
}

interface SyncResult extends MetafieldResult {
    bundleCount?: number;
}

/**
 * Auth context for metafield operations.
 * Accepts either a JWT sessionToken (from server actions) or
 * direct shop + accessToken (from cron/background jobs).
 */
export type MetafieldAuth = string | { shop: string; accessToken: string };

/** Converts MetafieldAuth to GraphQL request auth fields. */
function resolveAuth(auth: MetafieldAuth): {
    sessionToken?: string;
    shop?: string;
    accessToken?: string;
} {
    if (typeof auth === "string") {
        return { sessionToken: auth };
    }

    return { shop: auth.shop, accessToken: auth.accessToken };
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

    const ops: Promise<MetafieldResult>[] = [];

    if (addedProducts.length > 0) {
        ops.push(addBundleIdToProducts(sessionToken, bundleId, addedProducts));
    }
    if (removedProducts.length > 0) {
        ops.push(
            removeBundleIdFromProducts(sessionToken, bundleId, removedProducts),
        );
    }

    if (ops.length === 0) {
        return { success: true };
    }

    const results = await Promise.allSettled(ops);
    for (const r of results) {
        if (r.status === "fulfilled" && !r.value.success) {
            return r.value;
        }
        if (r.status === "rejected") {
            return { success: false, error: String(r.reason) };
        }
    }

    return { success: true };
}

// ============================================================================
// ACTIVE BUNDLES METAFIELD FUNCTIONS (for discount validation)
// ============================================================================

// Module-level ID cache — avoids redundant Shopify GQL calls for static IDs.
// Safe in serverless (one request per container) and Node (Map ops are atomic in event loop).
const ID_CACHE_TTL = 5 * 60 * 1000; // 5 min
const idCache = new Map<string, { value: string; expires: number }>();

function getCachedId(key: string): string | null {
    const entry = idCache.get(key);
    if (entry && Date.now() < entry.expires) return entry.value;
    if (entry) idCache.delete(key);
    return null;
}

function setCachedId(key: string, value: string): void {
    idCache.set(key, { value, expires: Date.now() + ID_CACHE_TTL });
}

async function getBundleDiscountId(
    auth: MetafieldAuth,
    shopDomain?: string,
): Promise<string | null> {
    const cacheKey = shopDomain ? `discount:${shopDomain}` : null;
    if (cacheKey) {
        const cached = getCachedId(cacheKey);
        if (cached) return cached;
    }

    try {
        const result = await executeGraphQLQuery<GetBundleDiscountIdQuery>({
            query: GetBundleDiscountIdDocument,
            variables: {
                query: `title:"${BUNDLE_DISCOUNT_TITLE}"`,
            },
            ...resolveAuth(auth),
        });

        const id = result.data?.discountNodes?.edges?.[0]?.node?.id || null;
        if (id && cacheKey) setCachedId(cacheKey, id);
        return id;
    } catch (error) {
        console.error("[Metafield] Failed to get discount ID:", error);
        return null;
    }
}

async function getShopId(
    auth: MetafieldAuth,
    shopDomain?: string,
): Promise<string | null> {
    const cacheKey = shopDomain ? `shop:${shopDomain}` : null;
    if (cacheKey) {
        const cached = getCachedId(cacheKey);
        if (cached) return cached;
    }

    try {
        const result = await executeGraphQLQuery<GetShopIdQuery>({
            query: GetShopIdDocument,
            variables: {},
            ...resolveAuth(auth),
        });

        const id = result.data?.shop?.id || null;
        if (id && cacheKey) setCachedId(cacheKey, id);
        return id;
    } catch (error) {
        console.error("[Metafield] Failed to get shop ID:", error);
        return null;
    }
}

/**
 * Builds the SHOP metafield value (full payload for Liquid/storefront).
 */
function buildShopBundlesMetafieldValue(
    bundles: Awaited<ReturnType<typeof findActiveBundlesByShop>>,
    freeShippingMethodTitle?: string,
    priceMap?: Map<string, number>,
): string {
    const bundleMap: Record<string, any> = {};

    for (const bundle of bundles) {
        const bundleProducts = bundle.bundleProducts || [];
        const productIds = bundleProducts.map((bp) => bp.productId);
        const productQuantities = bundleProducts.map((bp) => bp.quantity);

        const bundlePrice = priceMap
            ? bundle.bundleProducts?.reduce((sum, bp) => {
                  return sum + (priceMap.get(bp.productId) || 0) * bp.quantity;
              }, 0) || 0
            : 0;

        const effectiveSavings = priceMap
            ? calculateDiscountAmount(
                  bundlePrice,
                  bundle.discountType || "PERCENTAGE",
                  bundle.discountValue || 0,
                  bundle.maxDiscountAmount || 0,
              )
            : 0;

        const isBxgy = bundle.type === "BOGO" || bundle.type === "BUY_X_GET_Y";

        const productRoles = isBxgy
            ? bundleProducts.map((bp) => bp.role || "INCLUDED")
            : undefined;

        bundleMap[bundle.id] = {
            status: bundle.status,
            bundleType: bundle.type,
            discountType: bundle.discountType || "PERCENTAGE",
            discountValue: bundle.discountValue || 0,
            freeShipping: bundle.freeShipping || false,
            minOrderValue: bundle.minOrderValue || 0,
            maxDiscountAmount: bundle.maxDiscountAmount || 0,
            discountApplication: bundle.discountApplication || "bundle",
            discountedProductIds: bundle.discountedProductIds || [],
            freeShippingMethodTitle:
                freeShippingMethodTitle || "Free shipping with {name}",
            priority: bundle.priority ?? 0,
            createdAtTs: Math.floor(
                new Date(bundle.createdAt).getTime() / 1000,
            ),
            effectiveSavings: Math.round(effectiveSavings * 100) / 100,
            title: bundle.settings?.title ?? bundle.name,
            subtitle: bundle.settings?.subtitle || "",
            productCount: productIds.length,
            productIds: productIds,
            productQuantities: productQuantities,
            layout: bundle.settings?.layout || "list",
            buttonText: bundle.settings?.cartButtonText || "",
            showSavings: bundle.settings?.showSavings ?? true,
            showImages: bundle.settings?.showImages ?? true,
            showSavingsBadge: bundle.settings?.showSavingsBadge ?? true,
            showPrices: bundle.settings?.showPrices ?? true,
            showComparePrices: bundle.settings?.showComparePrices ?? true,
            showQuantity: bundle.settings?.showQuantity ?? true,
            showFreeShipping: bundle.settings?.showFreeShipping ?? true,
            enableHyperLink: bundle.settings?.enableHyperLink ?? false,
            mainProductId: bundle.mainProductId || null,
            mainVariantId: bundle.mainVariantId || null,
            ...(isBxgy && {
                buyQuantity: bundle.buyQuantity || 1,
                getQuantity: bundle.getQuantity || 1,
                usesPerOrderLimit: bundle.usesPerOrderLimit || null,
                productRoles: productRoles,
            }),
        };
    }

    return JSON.stringify(bundleMap);
}

/**
 * Builds the DISCOUNT node metafield value (minimal payload for Rust function).
 * Kept small to stay under the 10KB Function input metafield limit.
 */
function buildDiscountBundlesMetafieldValue(
    bundles: Awaited<ReturnType<typeof findActiveBundlesByShop>>,
    freeShippingMethodTitle?: string,
): string {
    const bundleMap: Record<string, any> = {};

    for (const bundle of bundles) {
        const bundleProducts = bundle.bundleProducts || [];
        const productQuantityMap: Record<string, number> = {};
        for (const bp of bundleProducts) {
            productQuantityMap[bp.productId] = bp.quantity;
        }

        const isBxgy = bundle.type === "BOGO" || bundle.type === "BUY_X_GET_Y";

        const productRoleMap: Record<string, string> | null = isBxgy
            ? (() => {
                  const roles: Record<string, string> = {};
                  for (const bp of bundleProducts) {
                      const role = bp.role || "INCLUDED";
                      if (
                          roles[bp.productId] === "TRIGGER" &&
                          role === "REWARD"
                      ) {
                          roles[bp.productId] = "REWARD";
                      } else if (!roles[bp.productId]) {
                          roles[bp.productId] = role;
                      }
                  }
                  return Object.keys(roles).length > 0 ? roles : null;
              })()
            : null;

        bundleMap[bundle.id] = {
            status: bundle.status,
            discountType: bundle.discountType || "PERCENTAGE",
            discountValue: bundle.discountValue || 0,
            freeShipping: bundle.freeShipping || false,
            minOrderValue: bundle.minOrderValue || 0,
            maxDiscountAmount: bundle.maxDiscountAmount || 0,
            discountApplication: bundle.discountApplication || "bundle",
            discountedProductIds: bundle.discountedProductIds || [],
            productQuantities: productQuantityMap,
            freeShippingMethodTitle:
                freeShippingMethodTitle || "Free shipping with {name}",
            mainProductId: bundle.mainProductId || null,
            ...(isBxgy && {
                bundleType: bundle.type,
                buyQuantity: bundle.buyQuantity || 1,
                getQuantity: bundle.getQuantity || 1,
                usesPerOrderLimit: bundle.usesPerOrderLimit || null,
                productRoles: productRoleMap,
            }),
        };
    }

    return JSON.stringify(bundleMap);
}

/**
 * Syncs all active bundles to BOTH discount metafield AND shop metafield.
 */
async function buildPriceMapForBundles(
    auth: MetafieldAuth,
    bundles: Awaited<ReturnType<typeof findActiveBundlesByShop>>,
): Promise<Map<string, number>> {
    const allProductIds = new Set<string>();
    bundles.forEach((b) =>
        b.bundleProducts?.forEach((bp) => allProductIds.add(bp.productId)),
    );

    const priceMap = new Map<string, number>();
    if (allProductIds.size === 0) return priceMap;

    const { productMap } = await fetchProductsFromShopify(auth, [
        ...allProductIds,
    ]);

    productMap.forEach((product, productId) => {
        const variants =
            (product as any).variants?.nodes || (product as any).variants || [];
        const price = parseFloat(variants[0]?.price || "0");
        priceMap.set(productId, price);
    });

    return priceMap;
}

export async function syncActiveBundlesToMetafield(
    auth: MetafieldAuth,
    shop: string,
): Promise<SyncResult> {
    try {
        const [discountId, shopId] = await Promise.all([
            getBundleDiscountId(auth, shop),
            getShopId(auth, shop),
        ]);

        if (!discountId) {
            console.error("[Metafield] Bundle discount not found");
            return {
                success: false,
                error: "Bundle discount not found. Please reinstall the app.",
            };
        }

        if (!shopId) {
            console.error("[Metafield] Shop ID not found");
            return {
                success: false,
                error: "Failed to get shop ID.",
            };
        }

        // Fetch all active bundles and app settings from database
        const [activeBundles, appSettings] = await Promise.all([
            findActiveBundlesByShop(shop),
            findSettingsByShopDomain(shop),
        ]);

        // Fetch product prices for effective savings calculation
        const priceMap = await buildPriceMapForBundles(auth, activeBundles);

        // Extract freeShippingMethodTitle from labels JSON
        const labels = appSettings?.labels as Record<string, string> | null;
        const freeShippingMethodTitle = labels?.freeShippingMethodTitle;

        const shopValue = buildShopBundlesMetafieldValue(
            activeBundles,
            freeShippingMethodTitle,
            priceMap,
        );
        const discountValue = buildDiscountBundlesMetafieldValue(
            activeBundles,
            freeShippingMethodTitle,
        );

        const result = await executeGraphQLMutation<MetafieldsSetMutation>({
            query: MetafieldsSetDocument,
            variables: {
                metafields: [
                    {
                        ownerId: discountId,
                        namespace: METAFIELD_NAMESPACE,
                        key: ACTIVE_BUNDLES_KEY,
                        type: JSON_TYPE,
                        value: discountValue,
                    },
                    {
                        ownerId: shopId,
                        namespace: METAFIELD_NAMESPACE,
                        key: ACTIVE_BUNDLES_KEY,
                        type: JSON_TYPE,
                        value: shopValue,
                    },
                ],
            },
            ...resolveAuth(auth),
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
 * Updates the discount's combinesWith setting to allow or disallow stacking.
 */
export async function updateDiscountCombinesWith(
    auth: MetafieldAuth,
    allowStacking: boolean,
    shopDomain?: string,
): Promise<{ success: boolean; error?: string }> {
    const discountId = await getBundleDiscountId(auth, shopDomain);
    if (!discountId) {
        return { success: false, error: "Bundle discount not found" };
    }

    const result =
        await executeGraphQLMutation<UpdateBundleDiscountCombinesWithMutation>({
            query: UpdateBundleDiscountCombinesWithDocument,
            variables: {
                id: discountId,
                combinesWith: {
                    productDiscounts: allowStacking,
                    orderDiscounts: allowStacking,
                    shippingDiscounts: allowStacking,
                },
            },
            ...resolveAuth(auth),
        });

    const userErrors =
        result.data?.discountAutomaticAppUpdate?.userErrors || [];
    if (userErrors.length > 0) {
        return { success: false, error: userErrors[0].message };
    }

    return { success: true };
}

/**
 * Syncs all data (global settings + active bundles) to shop and discount metafields.
 */
export async function syncAllSettingsToMetafields(
    auth: MetafieldAuth,
    shop: string,
    savedSettings?: AppSettingsFormData,
): Promise<SyncResult> {
    try {
        console.log("[Metafield] Starting full sync for:", shop);

        const [discountId, shopId] = await Promise.all([
            getBundleDiscountId(auth, shop),
            getShopId(auth, shop),
        ]);

        if (!discountId || !shopId) {
            return {
                success: false,
                error: "Could not get discount or shop ID",
            };
        }

        // Use provided settings or fetch from DB
        const [globalSettings, activeBundles] = await Promise.all([
            savedSettings
                ? Promise.resolve(transformFormDataToAppSettings(savedSettings))
                : findSettingsByShopDomain(shop),
            findActiveBundlesByShop(shop),
        ]);

        // Fetch product prices for effective savings calculation
        const priceMap = await buildPriceMapForBundles(auth, activeBundles);

        // Extract freeShippingMethodTitle from labels JSON
        const labels = globalSettings?.labels as Record<string, string> | null;
        const freeShippingMethodTitle = labels?.freeShippingMethodTitle;

        const globalSettingsValue =
            buildGlobalSettingsMetafieldValue(globalSettings);
        const shopBundlesValue = buildShopBundlesMetafieldValue(
            activeBundles,
            freeShippingMethodTitle,
            priceMap,
        );
        const discountBundlesValue = buildDiscountBundlesMetafieldValue(
            activeBundles,
            freeShippingMethodTitle,
        );

        const result = await executeGraphQLMutation<MetafieldsSetMutation>({
            query: MetafieldsSetDocument,
            variables: {
                metafields: [
                    {
                        ownerId: shopId,
                        namespace: METAFIELD_NAMESPACE,
                        key: METAFIELD_KEYS["GLOBAL_SETTINGS"],
                        type: "json",
                        value: globalSettingsValue,
                    },
                    {
                        ownerId: shopId,
                        namespace: METAFIELD_NAMESPACE,
                        key: METAFIELD_KEYS["ACTIVE_BUNDLES"],
                        type: "json",
                        value: shopBundlesValue,
                    },
                    {
                        ownerId: discountId,
                        namespace: METAFIELD_NAMESPACE,
                        key: METAFIELD_KEYS["ACTIVE_BUNDLES"],
                        type: "json",
                        value: discountBundlesValue,
                    },
                ],
            },
            ...resolveAuth(auth),
        });

        if (result.data?.metafieldsSet?.userErrors?.length) {
            return {
                success: false,
                error: result.data.metafieldsSet.userErrors[0].message,
            };
        }

        console.log("[Metafield] ✓ Shop and discount metafields synced");

        // ✅ Product bundle_ids are managed separately via
        // addBundleIdToProducts/removeBundleIdFromProducts
        // when bundles are created/updated

        console.log(`[Metafield] ✅ Full sync complete for ${shop}`);
        return { success: true, bundleCount: activeBundles.length };
    } catch (error) {
        console.error("[Metafield] Error syncing all settings:", error);
        return {
            success: false,
            error: error instanceof Error ? error.message : "Unknown error",
        };
    }
}
