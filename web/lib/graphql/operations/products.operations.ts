"use server";

import { createHash } from "crypto";
import {
    GetBundleProductsDocument,
    GetBundleProductsQuery,
} from "@/lib/graphql/generated/graphql";
import { executeGraphQLQuery } from "@/lib";
import { unstable_cache } from "next/cache";
import { Product, ProductVariant } from "@/shared";
import { cacheTags, cacheDurations } from "@/lib/cache/cache-tags";

/**
 * Core fetcher — hits the Shopify Admin API directly.
 * Not exported; callers should use fetchProductsFromShopify which adds caching.
 */
async function fetchProductsFromShopifyUncached(
    auth: string | { shop: string; accessToken: string },
    allProductIds: string[],
) {
    const productMap = new Map<string, Product>();
    const variantMap = new Map<string, ProductVariant>();

    if (allProductIds.length === 0) {
        return { productMap, variantMap };
    }

    const authFields =
        typeof auth === "string"
            ? { sessionToken: auth }
            : { shop: auth.shop, accessToken: auth.accessToken };

    const result = await executeGraphQLQuery<GetBundleProductsQuery>({
        query: GetBundleProductsDocument,
        variables: { ids: allProductIds },
        ...authFields,
    });

    if (!result.data?.nodes) {
        return { productMap, variantMap };
    }

    result.data.nodes.filter(Boolean).forEach((product) => {
        const prod = product as Product;
        productMap.set(prod.id, {
            id: prod.id,
            title: prod.title,
            featuredImage: prod.featuredMedia
                ? {
                      url: prod.featuredMedia.image.url,
                      altText: prod.featuredMedia.image.altText ?? prod.title,
                  }
                : undefined,
            handle: prod.handle,
            tags: prod.tags || [],
            variants: prod.variants || [],
            collections: prod.collections || [],
        });

        const variants = (prod as any).variants?.nodes || prod.variants || [];
        variants.forEach((variant: any) => {
            const var_ = variant as ProductVariant;
            variantMap.set(var_.id, {
                id: var_.id,
                title: var_.title,
                price: var_.price || "0",
                compareAtPrice: var_.compareAtPrice,
                availableForSale: var_.availableForSale ?? false,
                inventoryQuantity: var_.inventoryQuantity ?? 0,
                selectedOptions: var_.selectedOptions ?? [],
                inventoryItem: {
                    tracked: var_.inventoryItem?.tracked ?? false,
                },
                ...(var_.sku && { sku: var_.sku }),
                ...((var_ as any).media?.nodes?.[0]?.image && {
                    image: (var_ as any).media.nodes[0].image,
                }),
            } as ProductVariant);
        });
    });

    return { productMap, variantMap };
}

/**
 * Serialize Map results to plain objects for unstable_cache compatibility.
 * unstable_cache requires serializable return values (no Map/Set).
 */
function serializeProductMaps(maps: {
    productMap: Map<string, Product>;
    variantMap: Map<string, ProductVariant>;
}) {
    return {
        products: Object.fromEntries(maps.productMap),
        variants: Object.fromEntries(maps.variantMap),
    };
}

function deserializeProductMaps(cached: {
    products: Record<string, Product>;
    variants: Record<string, ProductVariant>;
}) {
    return {
        productMap: new Map(Object.entries(cached.products)),
        variantMap: new Map(Object.entries(cached.variants)),
    };
}

/**
 * Fetch product data from Shopify with server-side caching.
 *
 * Cache is keyed per shop + sorted product IDs so the same set of products
 * always hits the same cache entry regardless of call order.
 * TTL: 1 hour. Busted early by PRODUCTS_UPDATE/CREATE/DELETE webhooks
 * via revalidateTag(`shopify-products-${shop}`).
 *
 * Falls back to a direct API call if auth is a raw sessionToken (no shop
 * available for cache key scoping) — this preserves the existing behaviour
 * for callers that haven't been updated to pass { shop, accessToken }.
 */
export async function fetchProductsFromShopify(
    auth: string | { shop: string; accessToken: string },
    allProductIds: string[],
) {
    if (allProductIds.length === 0) {
        return {
            productMap: new Map<string, Product>(),
            variantMap: new Map<string, ProductVariant>(),
        };
    }

    // Only cache when we have a resolvable shop name for the cache key.
    // Raw sessionToken callers bypass caching to avoid a stale/wrong-shop hit.
    if (typeof auth === "object" && auth.shop) {
        const { shop, accessToken } = auth;
        const sortedIds = [...allProductIds].sort();
        const idsHash = createHash("sha256")
            .update(sortedIds.join(","))
            .digest("hex")
            .slice(0, 16);

        const cachedFetcher = unstable_cache(
            async () => {
                const maps = await fetchProductsFromShopifyUncached(
                    { shop, accessToken },
                    sortedIds,
                );
                return serializeProductMaps(maps);
            },
            [`shopify-products`, shop, idsHash],
            {
                tags: [cacheTags.shopifyProducts(shop)],
                revalidate: cacheDurations.shopifyProducts,
            },
        );

        const cached = await cachedFetcher();
        return deserializeProductMaps(cached);
    }

    // Fallback: sessionToken path — no caching (shop unknown at this point)
    return fetchProductsFromShopifyUncached(auth, allProductIds);
}
