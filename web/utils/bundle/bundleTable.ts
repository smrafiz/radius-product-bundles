import { bundleStatusConfigs, bundleTypeConfigs, discountTypeConfigs, } from "@/config";
import {
    BundleConfig,
    BundleStatus,
    BundleStatusBadge,
    BundleType,
    DiscountConfig,
    DiscountType,
    ProductGroup,
} from "@/types";

/**
 * Get bundle configuration properties
 *
 * @param type - The bundle type
 * @param property - The property to retrieve ('label', 'icon', 'slug')
 */
export const getBundleProperty = <
    T extends keyof Pick<BundleConfig, "label" | "icon" | "slug">,
>(
    type: BundleType,
    property: T,
): BundleConfig[T] | null => {
    const config = bundleTypeConfigs[type];
    return config?.[property] ?? null;
};

/**
 * Get status badge configuration
 */
export const getStatusBadge = (status: BundleStatus): BundleStatusBadge =>
    bundleStatusConfigs[status] ?? { text: status, tone: "subdued" };

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

