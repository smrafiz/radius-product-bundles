import { bundleTypeConfigs } from "@/config";
import {
    BundleType,
    SelectedItem,
    ProductGroup,
    BundleConfig,
    BundleState,
} from "@/types";

/**
 * Get bundle type options for select
 */
export const bundleTypeOptions = Object.values(bundleTypeConfigs).map((c) => ({
    label: c.label,
    value: c.id,
}));

/**
 * Map bundle type slug to ID
 */
export const bundleTypeMap = Object.values(bundleTypeConfigs).reduce(
    (acc, c) => {
        acc[c.slug] = c.id;
        return acc;
    },
    {} as Record<string, BundleType>,
);

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
 * Calculate total bundle price
 */
export function calculateBundlePrice(items: SelectedItem[]): number {
    return items.reduce((total, item) => {
        const price = parseFloat(item.price) || 0;
        return total + price * item.quantity;
    }, 0);
}

/**
 * Calculate discount amount based on discount type and value
 */
export function calculateDiscountAmount(
    bundlePrice: number,
    discountType: string,
    discountValue: number,
    maxDiscountAmount?: number,
): number {
    let discount = 0;

    switch (discountType) {
        case "PERCENTAGE":
            discount = (bundlePrice * discountValue) / 100;
            break;
        case "FIXED_AMOUNT":
            discount = discountValue;
            break;
        case "FREE_SHIPPING":
            discount = 0; // Shipping discount is handled separately
            break;
        default:
            discount = 0;
    }

    // Apply maximum discount cap if set
    if (maxDiscountAmount && discount > maxDiscountAmount) {
        discount = maxDiscountAmount;
    }

    // Discount cannot exceed bundle price
    return Math.min(discount, bundlePrice);
}

/**
 * Calculate final bundle price after discount
 */
export function calculateFinalPrice(
    bundlePrice: number,
    discountType: string,
    discountValue: number,
    maxDiscountAmount?: number,
): number {
    const discountAmount = calculateDiscountAmount(
        bundlePrice,
        discountType,
        discountValue,
        maxDiscountAmount,
    );

    return Math.max(0, bundlePrice - discountAmount);
}

/**
 * Format price for display
 */
export function formatPrice(price: number): string {
    return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
    }).format(price);
}

/**
 * Group selected items by product
 */
export function groupItemsByProduct(items: SelectedItem[]): ProductGroup[] {
    const groups: Record<string, ProductGroup> = {};

    items.forEach((item) => {
        if (!groups[item.productId]) {
            groups[item.productId] = {
                product: item,
                variants: [],
                originalTotalVariants: item.totalVariants || 1,
            };
        }
        if (item.type === "variant") {
            groups[item.productId].variants.push(item);
        }
    });

    return Object.values(groups);
}

/**
 * Generate unique item ID
 */
export function generateItemId(
    type: "product" | "variant",
    id: string,
): string {
    return `${type}-${id}`;
}

/**
 * Extract product ID from Shopify GID
 */
export function extractProductId(gid: string): string {
    return gid.split("/").pop() || gid;
}

/**
 * Validate if bundle meets minimum order requirements
 */
export function validateMinimumOrder(
    bundlePrice: number,
    minOrderValue?: number,
): boolean {
    if (!minOrderValue) return true;
    return bundlePrice >= minOrderValue;
}

/**
 * Calculate savings percentage
 */
export function calculateSavingsPercentage(
    originalPrice: number,
    discountedPrice: number,
): number {
    if (originalPrice === 0) return 0;
    return Math.round(
        ((originalPrice - discountedPrice) / originalPrice) * 100,
    );
}
