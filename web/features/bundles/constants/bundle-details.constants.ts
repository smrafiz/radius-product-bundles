/*
 * Bundle details constants
 */

export const WIDGET_LAYOUTS = [
    {
        label: "Horizontal Layout",
        value: "horizontal" as const,
        description: "Products displayed side by side",
    },
    {
        label: "Vertical Layout",
        value: "vertical" as const,
        description: "Products stacked vertically",
    },
    {
        label: "Grid Layout",
        value: "grid" as const,
        description: "Products in a responsive grid",
    },
];

export const WIDGET_POSITIONS = [
    { label: "Above Add to Cart", value: "above_cart" as const },
    { label: "Below Add to Cart", value: "below_cart" as const },
    { label: "In Product Description", value: "description" as const },
    { label: "Custom Position", value: "custom" as const },
];

export const COLOR_THEMES = [
    {
        label: "Brand",
        value: "brand" as const,
        background: "bg-fill-brand" as const,
    },
    {
        label: "Success",
        value: "success" as const,
        background: "bg-fill-success" as const,
    },
    {
        label: "Warning",
        value: "warning" as const,
        background: "bg-fill-warning" as const,
    },
    {
        label: "Critical",
        value: "critical" as const,
        background: "bg-fill-critical" as const,
    },
];

export const BUNDLE_STEPS = [
    {
        number: 1,
        title: "Products",
        description: "Select products for your bundle",
    },
    {
        number: 2,
        title: "Configuration",
        description: "Set up discount rules and behavior",
    },
    {
        number: 3,
        title: "Display",
        description: "Customize appearance and layout",
    },
    {
        number: 4,
        title: "Review",
        description: "Review and publish your bundle",
    },
];

export const ADVANCED_OPTIONS = [
    {
        key: "showPrices" as const,
        title: "Show individual product prices",
        description: "Display the price of each product within a bundle",
    },
    {
        key: "showSavings" as const,
        title: "Show bundle savings amount",
        description: "Show how much customers save by purchasing the bundle",
    },
    {
        key: "enableQuickSwap" as const,
        title: "Enable quick product swap",
        description:
            "Allow customers to quickly swap products within the bundle",
    },
];
