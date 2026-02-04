import { SettingsTabConfig } from "@/features/settings";

/**
 * General tab configuration
 */
export const GENERAL_TAB: SettingsTabConfig = {
    id: "general",
    title: "General",
    icon: "settings",
    sections: [
        // ─────────────────────────────────────────────────────────────────
        // DEFAULTS SECTION
        // ─────────────────────────────────────────────────────────────────
        {
            id: "defaults",
            title: "Defaults",
            tooltip: "Default values applied when creating new bundles.",
            columns: 2,
            fields: [
                {
                    type: "select",
                    name: "defaultDiscountType",
                    label: "Default discount type",
                    details: "Applied to new bundles by default",
                    defaultValue: "PERCENTAGE",
                    options: [
                        { value: "PERCENTAGE", label: "Percentage" },
                        { value: "FIXED_AMOUNT", label: "Fixed amount" },
                        { value: "CUSTOM_PRICE", label: "Custom price" },
                        { value: "NO_DISCOUNT", label: "No discount" },
                    ],
                    validation: {
                        required: "Please select a discount type",
                    },
                },
                {
                    type: "number",
                    name: "defaultDiscountValue",
                    label: "Default discount value",
                    details: "Default percentage or fixed amount",
                    defaultValue: 10,
                    min: 0,
                    max: 100,
                    validation: {
                        min: {
                            value: 0,
                            message: "Discount value must be at least 0",
                        },
                        max: {
                            value: 100,
                            message: "Discount value cannot exceed 100",
                        },
                    },
                },
                {
                    type: "number",
                    name: "maxBundleProducts",
                    label: "Max products per bundle",
                    details: "Maximum products allowed in a single bundle",
                    defaultValue: 10,
                    min: 2,
                    max: 50,
                    validation: {
                        min: {
                            value: 2,
                            message: "Minimum 2 products per bundle",
                        },
                        max: {
                            value: 50,
                            message: "Maximum 50 products per bundle",
                        },
                    },
                },
                {
                    type: "number",
                    name: "maxBundlesPerShop",
                    label: "Max bundles per shop",
                    details: "Total bundles limit (based on your plan)",
                    defaultValue: 5,
                    min: 1,
                    max: 500,
                    readOnly: true,
                },
            ],
        },

        // ─────────────────────────────────────────────────────────────────
        // CART BEHAVIOR SECTION
        // ─────────────────────────────────────────────────────────────────
        {
            id: "cart-behavior",
            title: "Cart Behavior",
            tooltip:
                "Control how the app interacts with the cart and checkout.",
            fields: [
                {
                    type: "select",
                    name: "redirectAfterCart",
                    label: "Redirect after add to cart",
                    details: "Where customers go after adding a bundle to cart",
                    defaultValue: "cart",
                    options: [
                        { value: "cart", label: "Cart page" },
                        { value: "checkout", label: "Checkout" },
                        { value: "none", label: "Stay on page (no redirect)" },
                        { value: "drawer", label: "Open cart drawer" },
                    ],
                },
                {
                    type: "switch",
                    name: "hidePaymentButtons",
                    label: "Hide third-party payment buttons",
                    details:
                        "Hides PayPal, Apple Pay, etc. in cart since bundle discounts only apply through standard checkout.",
                    defaultValue: false,
                },
                {
                    type: "switch",
                    name: "enableStockValidation",
                    label: "Enable stock validation",
                    details:
                        "Disables the bundle button when any product in the bundle is out of stock.",
                    defaultValue: true,
                },
            ],
        },

        // ─────────────────────────────────────────────────────────────────
        // DISCOUNT SECTION
        // ─────────────────────────────────────────────────────────────────
        {
            id: "discount",
            title: "Discount",
            tooltip: "Configure how discounts are displayed and tracked.",
            fields: [
                {
                    type: "text",
                    name: "discountTitle",
                    label: "Discount title",
                    placeholder: "Bundle Discount",
                    details:
                        "Customers will see this in their cart and at checkout.",
                    defaultValue: "Bundle Discount",
                    validation: {
                        required: "Discount title is required",
                        maxLength: {
                            value: 60,
                            message:
                                "Discount title cannot exceed 60 characters",
                        },
                    },
                },
                {
                    type: "switch",
                    name: "trackOrdersWithoutDiscount",
                    label: "Track orders without discount",
                    details:
                        "By default, only orders with discounts are tracked. Enable this to track any order containing bundle products.",
                    defaultValue: true,
                },
            ],
        },

        // ─────────────────────────────────────────────────────────────────
        // LOCALIZATION SECTION
        // ─────────────────────────────────────────────────────────────────
        {
            id: "localization",
            title: "Localization",
            tooltip: "Settings for multi-currency and multi-language stores.",
            fields: [
                {
                    type: "select",
                    name: "currencyDisplay",
                    label: "Currency display",
                    details: "How prices are displayed in the bundle widget",
                    defaultValue: "store",
                    options: [
                        { value: "store", label: "Use store default" },
                        {
                            value: "code",
                            label: "Always show currency code (e.g., USD)",
                        },
                        {
                            value: "symbol",
                            label: "Always show symbol (e.g., $)",
                        },
                    ],
                },
                {
                    type: "switch",
                    name: "disableCartLocale",
                    label: "Disable cart locale redirect",
                    details:
                        "Prevents redirect to localized cart URLs (e.g., /fr/cart). Enable this if you have issues with multi-language stores.",
                    defaultValue: false,
                },
            ],
        },

        // ─────────────────────────────────────────────────────────────────
        // PERFORMANCE SECTION
        // ─────────────────────────────────────────────────────────────────
        {
            id: "performance",
            title: "Performance",
            tooltip:
                "Control how storefront data is cached for faster page loads.",
            fields: [
                {
                    type: "select",
                    name: "cacheTtl",
                    label: "Storefront cache duration",
                    details:
                        "How long browsers cache product data. Longer = faster pages, but price/availability changes take longer to appear.",
                    defaultValue: "300",
                    options: [
                        { value: "0", label: "No cache" },
                        { value: "60", label: "1 minute" },
                        { value: "300", label: "5 minutes (recommended)" },
                        { value: "900", label: "15 minutes" },
                        { value: "3600", label: "1 hour" },
                    ],
                },
            ],
        },
    ],
};
