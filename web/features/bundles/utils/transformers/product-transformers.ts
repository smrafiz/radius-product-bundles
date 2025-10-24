/*
 * Product transformers
 */

import { ProductGroup } from "@/features/bundles";

/**
 * Group products by ID
 */
export function groupProductsById(products: any[]): ProductGroup[] {
    const groups: Record<string, ProductGroup> = {};

    products.forEach((product) => {
        if (!groups[product.id]) {
            groups[product.id] = {
                featuredImage: product.featuredImage
                    ? {
                        url: product.featuredImage.url,
                        altText: product.featuredImage.altText ?? product.title,
                    }
                    : undefined,
                id: product.id,
                title: product.title,
                handle: product.handle,
                product: product,
                variants: [],
                originalTotalVariants: product.totalVariants || 1,
            };
        }

        if (product.type === "variant") {
            groups[product.id].variants.push(product);
        }
    });

    return Object.values(groups);
}