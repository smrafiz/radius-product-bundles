/*
 * Discount types constants
 */

import { formatCurrency } from "@/shared";
import { BundleType, DiscountConfig, DiscountType } from "@/features/bundles";

/**
 * Discount types allowed per bundle type
 */
export const DISCOUNT_TYPES_BY_BUNDLE: Record<BundleType, DiscountType[]> = {
    FIXED_BUNDLE: ["PERCENTAGE", "FIXED_AMOUNT", "CUSTOM_PRICE", "NO_DISCOUNT"],
    FREQUENTLY_BOUGHT_TOGETHER: [
        "PERCENTAGE",
        "FIXED_AMOUNT",
        "CUSTOM_PRICE",
        "NO_DISCOUNT",
    ],
    BUY_X_GET_Y: ["PERCENTAGE", "FIXED_AMOUNT", "CUSTOM_PRICE", "NO_DISCOUNT"],
    BOGO: ["PERCENTAGE", "FIXED_AMOUNT", "CUSTOM_PRICE"],
    VOLUME_DISCOUNT: ["PERCENTAGE", "FIXED_AMOUNT", "NO_DISCOUNT"],
    MIX_AND_MATCH: [
        "PERCENTAGE",
        "FIXED_AMOUNT",
        "CUSTOM_PRICE",
        "NO_DISCOUNT",
    ],
};

/**
 * Get allowed discount types for a bundle type
 */
export function getDiscountTypesForBundle(
    bundleType: BundleType,
): DiscountConfig[] {
    const allowedTypes =
        DISCOUNT_TYPES_BY_BUNDLE[bundleType] ||
        (Object.keys(DISCOUNT_TYPES) as DiscountType[]);
    return allowedTypes.map((type) => DISCOUNT_TYPES[type]);
}

/**
 * Discount type configurations
 */
export const DISCOUNT_TYPES = {
    PERCENTAGE: {
        label: "Discount Percentage",
        id: "PERCENTAGE",
        slug: "percentage",
        description: "Reduce the bundle price by a percentage.",
        symbol: "%",
        suffix: "Off",
        format: (
            value = 0,
            formatCurrencyFn = formatCurrency,
            includeLabel = true,
        ) => (includeLabel ? `${value}% Off` : `${value}%`),
    },
    FIXED_AMOUNT: {
        label: "Discount Amount",
        id: "FIXED_AMOUNT",
        slug: "fixed-amount",
        description: "Reduce the bundle price by a fixed amount.",
        symbol: "$",
        suffix: "Off",
        format: (value = 0, formatCurrencyFn, includeLabel = true) => {
            const formatter = formatCurrencyFn || ((val: number) => `${val}`);
            return includeLabel
                ? `${formatter(value)} Off`
                : `${formatter(value)}`;
        },
    },
    CUSTOM_PRICE: {
        label: "Bundle Price",
        id: "CUSTOM_PRICE",
        slug: "custom-price",
        description: "Set a specific final price for the entire bundle.",
        symbol: "$",
        suffix: "",
        format: (value = 0, formatCurrencyFn, includeLabel = true) => {
            const formatter = formatCurrencyFn || ((val: number) => `${val}`);
            return includeLabel
                ? `Custom Price ${formatter(value)}`
                : `${formatter(value)} (Custom Price)`;
        },
    },
    NO_DISCOUNT: {
        label: "No Discount",
        id: "NO_DISCOUNT",
        slug: "no-discount",
        description: "Create bundles without applying a discount.",
        symbol: "",
        suffix: "",
        format: (value = 0, formatCurrency, includeLabel = true) =>
            includeLabel ? "No Discount" : `${value}`,
    },
    QUANTITY_BREAKS: {
        label: "Quantity Breaks",
        id: "QUANTITY_BREAKS",
        slug: "quantity-breaks",
        description:
            "Set different prices based on how many items customers buy",
        symbol: "",
        suffix: "",
        format: (value = 0, formatCurrency, includeLabel = true) =>
            `Volume Discount (${value}% Off)`,
    },
    // Frequently Bought Together: Show products that customers often purchase together.
    // Mix & Match: Let customers select items to build their own bundle.
} as const satisfies Record<DiscountType, DiscountConfig>;
