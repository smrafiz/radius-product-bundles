/*
 * Product transformers
 */

import { ProductGroup, SelectedItem } from "@/features/bundles";

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
                          altText:
                              product.featuredImage.altText ?? product.title,
                      }
                    : undefined,
                id: product.id,
                title: product.title,
                handle: product.handle,
                product: product,
                variants: [],
                originalTotalVariants: product.totalVariants || 1,
                quantity: product.quantity || 1,
            };
        }

        if (product.type === "variant") {
            groups[product.id].variants.push(product);
        }
    });

    return Object.values(groups);
}

export function createSelectedItem(
    product: any,
    options?: {
        quantity?: number;
        displayOrder?: number;
        isRequired?: boolean;
    },
): SelectedItem {
    const variants = product.variants || [];
    const variantIds = variants.map((v: any) => v.id);
    const defaultVariant = variants[0];
    const selectedVariantObjs: SelectedItem["variants"] = variants.map((v: any) => ({
        id: v.id,
        title: v.title || "",
        price: v.price || "0.00",
        compareAtPrice: v.compareAtPrice || null,
        image: v.image?.originalSrc || v.image?.url || undefined,
        availableForSale: v.availableForSale !== false,
        inventoryQuantity: v.inventoryQuantity || 0,
    }));

    const isDefaultVariant =
        defaultVariant?.title === "Default Title" ||
        defaultVariant?.title === "Default";
    const isSingleVariantSelected = variantIds.length === 1 && !isDefaultVariant;

    return {
        id: `product-${product.id}`,
        productId: product.id,
        variantId: variantIds[0],
        variantIds: variantIds,
        quantity: options?.quantity || 1,
        type: "product" as const,
        title: product.title,
        price: defaultVariant?.price || "0.00",
        compareAtPrice: defaultVariant?.compareAtPrice || null,
        url: product.url || "",
        image:
            product.images?.[0]?.originalSrc ||
            product.featuredImage?.url ||
            "",
        sku: defaultVariant?.sku || "",
        handle: product.handle,
        vendor: product.vendor,
        productType: product.productType,
        totalVariants: product.totalVariants || variants.length,
        displayOrder: options?.displayOrder || 0,
        isRequired: options?.isRequired ?? true,
        inventoryQuantity: defaultVariant?.inventoryQuantity || 0,
        availableForSale: defaultVariant?.availableForSale !== false,
        selectedVariant: isSingleVariantSelected && defaultVariant
            ? {
                  id: defaultVariant.id,
                  title: defaultVariant.title,
                  price: defaultVariant.price || "0.00",
                  compareAtPrice: defaultVariant.compareAtPrice || null,
                  availableForSale: defaultVariant.availableForSale !== false,
                  inventoryQuantity: defaultVariant.inventoryQuantity || 0,
                  productId: product.id,
              }
            : undefined,
        variants: (selectedVariantObjs ?? []).length > 0 ? selectedVariantObjs : undefined,
    };
}
