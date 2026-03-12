import { SettingsTabConfig } from "@/features/settings";

/**
 * Labels tab configuration
 *
 * Uses parentPath: "labels" so fields map to labels.headingLabel, labels.addToCartText, etc.
 */
export const LABELS_TAB: SettingsTabConfig = {
    id: "labels",
    title: "Labels",
    icon: "text-block",
    parentPath: "labels",
    sections: [
        // ─────────────────────────────────────────────────────────────────
        // WIDGET TEXT SECTION
        // ─────────────────────────────────────────────────────────────────
        {
            id: "widget-text",
            title: "Widget Texts",
            tooltip: "Customize the main texts displayed in bundle widgets.",
            columns: 1,
            fields: [
                {
                    type: "text",
                    name: "headingLabel",
                    label: "Bundle heading",
                    placeholder: "Bundle & Save",
                    details: "Main heading displayed above the bundle widget.",
                    validation: {
                        maxLength: {
                            value: 100,
                            message: "Heading cannot exceed 100 characters",
                        },
                    },
                },
                {
                    type: "text",
                    name: "addToCartText",
                    label: "Add to cart button",
                    placeholder: "Add Bundle to Cart",
                    details: "Text on the add to cart button.",
                    validation: {
                        maxLength: {
                            value: 50,
                            message: "Button text cannot exceed 50 characters",
                        },
                    },
                },
                {
                    type: "text",
                    name: "quantityLabel",
                    label: "Quantity label",
                    placeholder: "Qty:",
                    details: "Label before quantity selector.",
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
                    type: "text",
                    name: "addingText",
                    label: "Adding text",
                    placeholder: "Adding...",
                    details: "Shown while adding to cart.",
                    validation: {
                        maxLength: {
                            value: 30,
                            message: "Adding text cannot exceed 30 characters",
                        },
                    },
                },
                {
                    type: "text",
                    name: "addedText",
                    label: "Added text",
                    placeholder: "Added!",
                    details: "Shown after successful add.",
                    validation: {
                        maxLength: {
                            value: 30,
                            message: "Added text cannot exceed 30 characters",
                        },
                    },
                },
                {
                    type: "text",
                    name: "outOfStockText",
                    label: "Out of stock text",
                    placeholder: "Out of Stock",
                    details: "Shown when unavailable.",
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
                    type: "text",
                    name: "regularPriceLabel",
                    label: "Regular price label",
                    placeholder: "Regular Price:",
                    details: "Label for the original total price.",
                    validation: {
                        maxLength: {
                            value: 30,
                            message:
                                "Regular price label cannot exceed 30 characters",
                        },
                    },
                },
                {
                    type: "text",
                    name: "bundlePriceLabel",
                    label: "Bundle price label",
                    placeholder: "Bundle Price:",
                    details: "Label for the discounted bundle price.",
                    validation: {
                        maxLength: {
                            value: 30,
                            message:
                                "Bundle price label cannot exceed 30 characters",
                        },
                    },
                },
                {
                    type: "text",
                    name: "youSaveLabel",
                    label: "Savings label",
                    placeholder: "You Save:",
                    details: "Label for the savings amount.",
                    validation: {
                        maxLength: {
                            value: 30,
                            message:
                                "Savings label cannot exceed 30 characters",
                        },
                    },
                },
                {
                    type: "text",
                    name: "savingsBadgeText",
                    label: "Savings badge text",
                    placeholder: "Save {amount}",
                    details:
                        "Text on savings badge. Use {amount} for the discount value.",
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
                    type: "text",
                    name: "freeShippingLabel",
                    label: "Free shipping label",
                    placeholder: "Free Shipping",
                    details: "Displayed when bundle includes free shipping.",
                    validation: {
                        maxLength: {
                            value: 30,
                            message:
                                "Free shipping label cannot exceed 30 characters",
                        },
                    },
                },
                {
                    type: "text",
                    name: "freeShippingMethodTitle",
                    label: "Free shipping method title",
                    placeholder: "Free shipping with {name}",
                    details:
                        "Shipping discount message shown at checkout. Use {name} for bundle name.",
                    validation: {
                        maxLength: {
                            value: 80,
                            message:
                                "Shipping method title cannot exceed 80 characters",
                        },
                    },
                },
            ],
        },

        // ─────────────────────────────────────────────────────────────────
        // CART LIMITS SECTION
        // ─────────────────────────────────────────────────────────────────
        {
            id: "cart-limits",
            title: "Cart Limits",
            tooltip: "Text shown when cart bundle limits are reached.",
            columns: 1,
            fields: [
                {
                    type: "text",
                    name: "maxBundlesReachedText",
                    label: "Max bundles reached message",
                    placeholder: "Maximum {count} bundle(s) per order allowed",
                    details:
                        "Shown when customer tries to exceed the max bundles per order limit. Use {count} for the limit number.",
                    validation: {
                        maxLength: {
                            value: 100,
                            message: "Cannot exceed 100 characters",
                        },
                    },
                },
            ],
        },

        // ─────────────────────────────────────────────────────────────────
        // BOGO LABELS SECTION
        // ─────────────────────────────────────────────────────────────────
        {
            id: "bogo-labels",
            title: "BOGO / Buy X Get Y Labels",
            tooltip: "Labels specific to BOGO and Buy X Get Y bundle layouts.",
            columns: 2,
            fields: [
                {
                    type: "text",
                    name: "bogoBadgeText",
                    label: "Deal badge text",
                    placeholder: "Buy 1 Get 1 Free",
                    details:
                        "Custom deal badge text. Leave empty to auto-generate from quantities and discount.",
                    validation: {
                        maxLength: {
                            value: 50,
                            message: "Cannot exceed 50 characters",
                        },
                    },
                },
                {
                    type: "text",
                    name: "bogoFreeText",
                    label: "Free text",
                    placeholder: "FREE",
                    details:
                        "Text shown on reward products when they are free (100% discount).",
                    validation: {
                        maxLength: {
                            value: 20,
                            message: "Cannot exceed 20 characters",
                        },
                    },
                },
                {
                    type: "text",
                    name: "bogoYouPayLabel",
                    label: "You pay label",
                    placeholder: "You Pay Only",
                    details: "Label above the final price in the pricing bar.",
                    validation: {
                        maxLength: {
                            value: 30,
                            message: "Cannot exceed 30 characters",
                        },
                    },
                },
                {
                    type: "text",
                    name: "bogoYouSaveLabel",
                    label: "You save label",
                    placeholder: "You Save",
                    details:
                        "Label above the savings amount in the pricing bar.",
                    validation: {
                        maxLength: {
                            value: 30,
                            message: "Cannot exceed 30 characters",
                        },
                    },
                },
                {
                    type: "text",
                    name: "bogoTriggerBadgeText",
                    label: "Trigger badge text",
                    placeholder: "You Buy",
                    details: "Badge on the trigger (buy) product card.",
                    validation: {
                        maxLength: {
                            value: 30,
                            message: "Cannot exceed 30 characters",
                        },
                    },
                },
                {
                    type: "text",
                    name: "bogoRewardBadgeText",
                    label: "Reward badge text",
                    placeholder: "You Get FREE",
                    details: "Badge on the reward (get) product card.",
                    validation: {
                        maxLength: {
                            value: 30,
                            message: "Cannot exceed 30 characters",
                        },
                    },
                },
                {
                    type: "text",
                    name: "bogoTotalLabel",
                    label: "Total label",
                    placeholder: "Total",
                    details: "Label before the total price in the footer.",
                    validation: {
                        maxLength: {
                            value: 20,
                            message: "Cannot exceed 20 characters",
                        },
                    },
                },
                {
                    type: "text",
                    name: "bogoSaveText",
                    label: "Save text",
                    placeholder: "Save {amount}",
                    details:
                        "Savings text in the footer. Use {amount} for the value.",
                    validation: {
                        maxLength: {
                            value: 30,
                            message: "Cannot exceed 30 characters",
                        },
                    },
                },
                {
                    type: "text",
                    name: "checklistProgressText",
                    label: "Checklist progress text",
                    placeholder: "{count}/{total} items added",
                    details:
                        "Progress count text. Use {count} for checked items and {total} for total items.",
                    validation: {
                        maxLength: {
                            value: 50,
                            message: "Cannot exceed 50 characters",
                        },
                    },
                },
                {
                    type: "text",
                    name: "checklistHintText",
                    label: "Checklist hint text",
                    placeholder: "{remaining} more to unlock!",
                    details:
                        "Hint shown when items remain. Use {remaining} for remaining count.",
                    validation: {
                        maxLength: {
                            value: 50,
                            message: "Cannot exceed 50 characters",
                        },
                    },
                },
                {
                    type: "text",
                    name: "checklistCompletedText",
                    label: "Checklist completed text",
                    placeholder: "Unlocked!",
                    details: "Hint shown when all items are selected.",
                    validation: {
                        maxLength: {
                            value: 30,
                            message: "Cannot exceed 30 characters",
                        },
                    },
                },
                {
                    type: "text",
                    name: "checklistLockedLabel",
                    label: "Locked reward label",
                    placeholder: "Unlock by adding all items above",
                    details:
                        "Reward section heading when items are not yet selected.",
                    validation: {
                        maxLength: {
                            value: 60,
                            message: "Cannot exceed 60 characters",
                        },
                    },
                },
                {
                    type: "text",
                    name: "checklistUnlockedLabel",
                    label: "Unlocked reward label",
                    placeholder: "Reward Unlocked",
                    details:
                        "Reward section heading when all items are selected.",
                    validation: {
                        maxLength: {
                            value: 60,
                            message: "Cannot exceed 60 characters",
                        },
                    },
                },
                {
                    type: "text",
                    name: "checklistPricingLockedText",
                    label: "Pricing locked text",
                    placeholder: "Select all items to see your price",
                    details:
                        "Text shown in pricing box before all items are selected.",
                    validation: {
                        maxLength: {
                            value: 60,
                            message: "Cannot exceed 60 characters",
                        },
                    },
                },
            ],
        },

        // ─────────────────────────────────────────────────────────────────
        // CART BANNER SECTION
        // ─────────────────────────────────────────────────────────────────
        {
            id: "cart-banner",
            title: "Cart Page Savings Banner",
            tooltip: "Text displayed in the cart page savings banner.",
            columns: 2,
            fields: [
                {
                    type: "text",
                    name: "bannerSavingText",
                    label: "Savings message",
                    placeholder: "You're saving {discount} with {name}",
                    details:
                        "Use {discount} for savings value and {name} for bundle name.",
                    validation: {
                        maxLength: {
                            value: 100,
                            message: "Cannot exceed 100 characters",
                        },
                    },
                },
                {
                    type: "text",
                    name: "bannerCustomPriceText",
                    label: "Custom price message",
                    placeholder: "Special price: {price} for {name}",
                    details:
                        "Use {price} for bundle price and {name} for bundle name.",
                    validation: {
                        maxLength: {
                            value: 100,
                            message: "Cannot exceed 100 characters",
                        },
                    },
                },
                {
                    type: "text",
                    name: "bannerFreeShippingQualifyText",
                    label: "Free shipping qualify message",
                    placeholder: "{name} qualifies for free shipping!",
                    details:
                        "Use {name} for bundle name. Shown for bundles with free shipping only.",
                    validation: {
                        maxLength: {
                            value: 100,
                            message: "Cannot exceed 100 characters",
                        },
                    },
                },
                {
                    type: "text",
                    name: "bannerFreeShippingText",
                    label: "Free shipping included message",
                    placeholder: "Free shipping included!",
                    details:
                        "Additional message when bundle includes free shipping.",
                    validation: {
                        maxLength: {
                            value: 100,
                            message: "Cannot exceed 100 characters",
                        },
                    },
                },
            ],
        },
    ],
};
