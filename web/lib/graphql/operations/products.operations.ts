"use server";

import {
    GetBundleProductsDocument,
    GetBundleProductsQuery,
} from "@/lib/graphql/generated/graphql";
import { executeGraphQLQuery } from "@/lib";
import { Product, ProductVariant } from "@/shared";

export async function fetchProductsFromShopify(
    sessionToken: string,
    allProductIds: string[],
) {
    const productMap = new Map<string, Product>();
    const variantMap = new Map<string, ProductVariant>();

    if (allProductIds.length === 0) {
        return { productMap, variantMap };
    }

    const result = await executeGraphQLQuery<GetBundleProductsQuery>({
        query: GetBundleProductsDocument,
        variables: { ids: allProductIds },
        sessionToken,
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
                ...(var_.image && { image: var_.image }),
            } as ProductVariant);
        });
    });

    return { productMap, variantMap };
}
