import { formatCurrency } from "@/utils";
import { DiscountConfig, DiscountType } from "@/types";

export const discountTypeConfigs: Record<DiscountType, DiscountConfig> = {
    PERCENTAGE: {
        label: "Discount Percentage",
        id: "PERCENTAGE",
        slug: "percentage",
        description: "Discount as a percentage of the original price",
        symbol: "%",
        suffix: "Off",
        format: (value = 0, formatCurrencyFn = formatCurrency, includeLabel = true) =>
            includeLabel ? `${value}% Off` : `${value}%`,
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
            return includeLabel ? `${formatter(value)} Off` : `${formatter(value)}`;
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
            return includeLabel ? `Custom Price ${formatter(value)}` : `${formatter(value)} (Custom Price)`;
        },
    },
    FREE_SHIPPING: {
        label: "Free Shipping",
        id: "FREE_SHIPPING",
        slug: "free-shipping",
        description: "Free shipping on bundle purchase",
        symbol: "",
        suffix: "",
        format: (value, formatCurrency, includeLabel = true) => "Free shipping",
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
        format: (value = 0, formatCurrency, includeLabel = true) => `Buy X Get Y (${value}% Off)`,
    },
    QUANTITY_BREAKS: {
        label: "Quantity Breaks",
        id: "QUANTITY_BREAKS",
        slug: "quantity-breaks",
        description: "Volume-based pricing with quantity tiers",
        symbol: "",
        suffix: "",
        format: (value = 0, formatCurrency, includeLabel = true) => `Volume Discount (${value}% Off)`,
    },
};
