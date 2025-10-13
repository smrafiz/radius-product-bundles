import { bundleTypeConfigs, discountTypeConfigs, } from "@/config";
import { BundleStatus, BundleType, DiscountConfig, DiscountType, ProductGroup, } from "@/types";
import { BUNDLE_STATUSES, BundleConfig, BundleStatusBadge, } from "@/features/bundles";

/**
 * Group products by ID
 */
export function groupProductsById(products: any[]): ProductGroup[] {
    const groups: Record<string, ProductGroup> = {};

    products.forEach((product) => {
        if (!groups[product.id]) {
            groups[product.id] = {
                featuredImage: product.featuredImage,
                id: product.id,
                title: product.title,
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

export const getDiscountProperty = <
    T extends keyof Pick<
        DiscountConfig,
        "label" | "slug" | "description" | "symbol" | "suffix" | "format"
    >,
>(
    type: DiscountType,
    property: T,
): DiscountConfig[T] | null => {
    const config = discountTypeConfigs[type];
    return config?.[property] ?? null;
};
