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
    FREQUENTLY_BOUGHT_TOGETHER: ["PERCENTAGE", "FIXED_AMOUNT", "CUSTOM_PRICE", "NO_DISCOUNT"],
    BUY_X_GET_Y: ["PERCENTAGE", "FIXED_AMOUNT", "NO_DISCOUNT"],
    BOGO: ["PERCENTAGE", "FIXED_AMOUNT", "NO_DISCOUNT"],
    VOLUME_DISCOUNT: ["PERCENTAGE", "FIXED_AMOUNT", "NO_DISCOUNT"],
    MIX_AND_MATCH: ["PERCENTAGE", "FIXED_AMOUNT", "CUSTOM_PRICE", "NO_DISCOUNT"],
};

/**
 * Get allowed discount types for a bundle type
 */
export function getDiscountTypesForBundle(bundleType: BundleType): DiscountConfig[] {
    const allowedTypes = DISCOUNT_TYPES_BY_BUNDLE[bundleType] || Object.keys(DISCOUNT_TYPES) as DiscountType[];
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
        description: "Discount as a percentage of the original price",
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
        description: "Fixed dollar amount discount",
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
        description: "Set a specific price for the bundle",
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
        description: "Bundle with no discount applied",
        symbol: "",
        suffix: "",
        format: (value = 0, formatCurrency, includeLabel = true) =>
            includeLabel ? "No Discount" : `${value}`,
    },
    BUY_X_GET_Y: {
        label: "Buy X Get Y",
        id: "BUY_X_GET_Y",
        slug: "buy-x-get-y",
        description: "Buy certain quantity and get items free/discounted",
        symbol: "",
        suffix: "",
        format: (value = 0, formatCurrency, includeLabel = true) =>
            `Buy X Get Y (${value}% Off)`,
    },
    QUANTITY_BREAKS: {
        label: "Quantity Breaks",
        id: "QUANTITY_BREAKS",
        slug: "quantity-breaks",
        description: "Volume-based pricing with quantity tiers",
        symbol: "",
        suffix: "",
        format: (value = 0, formatCurrency, includeLabel = true) =>
            `Volume Discount (${value}% Off)`,
    },
} as const satisfies Record<DiscountType, DiscountConfig>;
