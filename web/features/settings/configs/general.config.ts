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
                    name: "bundlePriorityType",
                    label: "Bundle priority strategy",
                    details:
                        "When multiple bundles apply to a product, determines which one is displayed. Index-based uses manual priority numbers; Discount-based picks the bundle with the highest effective savings.",
                    defaultValue: "index_based",
                    fullWidth: true,
                    proFeature: "advanced_cart_controls",
                    options: [
                        {
                            value: "index_based",
                            label: "Index based (manual priority)",
                        },
                        {
                            value: "discount_based",
                            label: "Discount based (highest savings wins)",
                        },
                    ],
                },
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
                    proFeature: "advanced_cart_controls",
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
                    proFeature: "advanced_cart_controls",
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
                {
                    type: "switch",
                    name: "showSavingsBanner",
                    label: "Show savings banner in cart",
                    details:
                        "Display a banner on the cart page showing how much customers save with their bundles.",
                    defaultValue: false,
                    proFeature: "advanced_cart_controls",
                },
                {
                    type: "switch",
                    name: "allowDiscountStacking",
                    label: "Allow discount stacking",
                    details:
                        "Let bundle discounts combine with other store discounts (coupon codes, automatic discounts, shipping discounts).",
                    defaultValue: false,
                    proFeature: "advanced_cart_controls",
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
                {
                    type: "switch",
                    name: "lazyLoadImages",
                    label: "Lazy load product images",
                    details:
                        "Defer loading of product images until they are visible on screen. Improves initial page load speed.",
                    defaultValue: true,
                },
            ],
        },
    ],
};
