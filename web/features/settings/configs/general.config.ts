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
            columns: 2,
            tooltip:
                "Control how the app interacts with the cart and checkout.",
            fields: [
                {
                    type: "select",
                    name: "redirectAfterCart",
                    label: "After add to cart",
                    details:
                        "Select what should happen after a customer adds a bundle to the cart.",
                    defaultValue: "default",
                    options: [
                        { value: "default", label: "Default theme behavior" },
                        { value: "cart", label: "Redirect to cart page" },
                        { value: "checkout", label: "Redirect to checkout" },
                        {
                            value: "none",
                            label: "Stay on page (show notification)",
                        },
                    ],
                },
                {
                    type: "switch",
                    name: "hidePaymentButtons",
                    label: "Hide third-party payment buttons",
                    details:
                        "Hides PayPal, Apple Pay, etc. on product and cart pages. Does not affect checkout page.",
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
                {
                    type: "number",
                    name: "maxBundlesPerOrder",
                    label: "Max bundles per order",
                    details:
                        "Limit how many bundles a customer can add to their cart. Prevents discount abuse. 0 = unlimited.",
                    defaultValue: 0,
                    min: 0,
                    max: 10,
                    validation: {
                        min: {
                            value: 0,
                            message: "Value must be 0 or greater",
                        },
                        max: {
                            value: 10,
                            message: "Maximum limit is 10",
                        },
                    },
                },
            ],
        },

        // ─────────────────────────────────────────────────────────────────
        // PRIVACY SECTION
        // ─────────────────────────────────────────────────────────────────
        {
            id: "privacy",
            title: "Privacy",
            tooltip: "Control data collection and tracking behavior.",
            fields: [
                {
                    type: "switch",
                    name: "enableAnalytics",
                    label: "Enable analytics tracking",
                    details:
                        "Track bundle views, add-to-carts, and purchases. Disable for GDPR compliance or if you use external analytics.",
                    defaultValue: true,
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
