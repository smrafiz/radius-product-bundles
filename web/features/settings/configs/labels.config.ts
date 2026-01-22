import { SettingsTabConfig } from "@/features/settings";

/**
 * Labels tab configuration
 */
export const LABELS_TAB: SettingsTabConfig = {
    id: "labels",
    title: "Labels",
    icon: "text-block",
    type: "labels",
    labelSections: [
        // ─────────────────────────────────────────────────────────────────
        // WIDGET TEXT SECTION
        // ─────────────────────────────────────────────────────────────────
        {
            id: "widget-text",
            title: "Widget Text",
            tooltip: "Customize the main text displayed in bundle widgets.",
            columns: 1,
            fields: [
                {
                    name: "headingLabel",
                    label: "Bundle heading",
                    placeholder: "Bundle & Save",
                    details: "Main heading displayed above the bundle widget.",
                    defaultValue: "Bundle & Save",
                    validation: {
                        maxLength: {
                            value: 100,
                            message: "Heading cannot exceed 100 characters",
                        },
                    },
                },
                {
                    name: "addToCartText",
                    label: "Add to cart button",
                    placeholder: "Add Bundle to Cart",
                    details: "Text on the add to cart button.",
                    defaultValue: "Add Bundle to Cart",
                    validation: {
                        maxLength: {
                            value: 50,
                            message: "Button text cannot exceed 50 characters",
                        },
                    },
                },
                {
                    name: "quantityLabel",
                    label: "Quantity label",
                    placeholder: "Qty:",
                    details: "Label before quantity selector.",
                    defaultValue: "Qty:",
                    validation: {
                        maxLength: {
                            value: 20,
                            message:
                                "Quantity label cannot exceed 20 characters",
                        },
                    },
                },
            ],
        },

        // ─────────────────────────────────────────────────────────────────
        // BUTTON STATES SECTION
        // ─────────────────────────────────────────────────────────────────
        {
            id: "button-states",
            title: "Button States",
            tooltip: "Text shown during different button states.",
            columns: 3,
            fields: [
                {
                    name: "addingText",
                    label: "Adding text",
                    placeholder: "Adding...",
                    details: "Shown while adding to cart.",
                    defaultValue: "Adding...",
                    validation: {
                        maxLength: {
                            value: 30,
                            message: "Adding text cannot exceed 30 characters",
                        },
                    },
                },
                {
                    name: "addedText",
                    label: "Added text",
                    placeholder: "Added!",
                    details: "Shown after successful add.",
                    defaultValue: "Added!",
                    validation: {
                        maxLength: {
                            value: 30,
                            message: "Added text cannot exceed 30 characters",
                        },
                    },
                },
                {
                    name: "outOfStockText",
                    label: "Out of stock text",
                    placeholder: "Out of Stock",
                    details: "Shown when unavailable.",
                    defaultValue: "Out of Stock",
                    validation: {
                        maxLength: {
                            value: 30,
                            message:
                                "Out of stock text cannot exceed 30 characters",
                        },
                    },
                },
            ],
        },

        // ─────────────────────────────────────────────────────────────────
        // PRICE LABELS SECTION
        // ─────────────────────────────────────────────────────────────────
        {
            id: "price-labels",
            title: "Price Labels",
            tooltip: "Labels displayed next to prices in the bundle widget.",
            columns: 2,
            fields: [
                {
                    name: "regularPriceLabel",
                    label: "Regular price label",
                    placeholder: "Regular Price:",
                    details: "Label for the original total price.",
                    defaultValue: "Regular Price:",
                    validation: {
                        maxLength: {
                            value: 30,
                            message:
                                "Regular price label cannot exceed 30 characters",
                        },
                    },
                },
                {
                    name: "bundlePriceLabel",
                    label: "Bundle price label",
                    placeholder: "Bundle Price:",
                    details: "Label for the discounted bundle price.",
                    defaultValue: "Bundle Price:",
                    validation: {
                        maxLength: {
                            value: 30,
                            message:
                                "Bundle price label cannot exceed 30 characters",
                        },
                    },
                },
                {
                    name: "youSaveLabel",
                    label: "Savings label",
                    placeholder: "You Save:",
                    details: "Label for the savings amount.",
                    defaultValue: "You Save:",
                    validation: {
                        maxLength: {
                            value: 30,
                            message:
                                "Savings label cannot exceed 30 characters",
                        },
                    },
                },
                {
                    name: "savingsBadgeText",
                    label: "Savings badge text",
                    placeholder: "Save {percent}%",
                    details:
                        "Text on savings badge. Use {percent} for dynamic value.",
                    defaultValue: "Save {percent}%",
                    validation: {
                        maxLength: {
                            value: 30,
                            message:
                                "Savings badge text cannot exceed 30 characters",
                        },
                    },
                },
            ],
        },

        // ─────────────────────────────────────────────────────────────────
        // SHIPPING LABELS SECTION
        // ─────────────────────────────────────────────────────────────────
        {
            id: "shipping-labels",
            title: "Shipping Labels",
            tooltip: "Text related to shipping displayed in the widget.",
            columns: 2,
            fields: [
                {
                    name: "freeShippingLabel",
                    label: "Free shipping label",
                    placeholder: "Free Shipping",
                    details: "Displayed when bundle includes free shipping.",
                    defaultValue: "Free Shipping",
                    validation: {
                        maxLength: {
                            value: 30,
                            message:
                                "Free shipping label cannot exceed 30 characters",
                        },
                    },
                },
                {
                    name: "freeShippingMethodTitle",
                    label: "Free shipping method title",
                    placeholder: "Free Shipping",
                    details: "Shipping method name shown at checkout.",
                    defaultValue: "Free Shipping",
                    validation: {
                        maxLength: {
                            value: 50,
                            message:
                                "Shipping method title cannot exceed 50 characters",
                        },
                    },
                },
            ],
        },
    ],
};
