/*
 * Bundle details constants
 */

export const WIDGET_LAYOUTS = [
    {
        label: "Horizontal Layout",
        value: "horizontal" as const,
        widgetLayout:"/assets/widget-horizontal-layout.png",
    },
    {
        label: "Vertical Layout",
        value: "vertical" as const,
        widgetLayout:"/assets/widget-vertical-layout.png",
    },
    {
        label: "Grid Layout",
        value: "grid" as const,
        widgetLayout:"/assets/widget-grid-layout.png",
    },
];

export const WIDGET_POSITIONS = [
    { label: "Above add to cart", value: "above_cart" as const },
    { label: "Below add to cart", value: "below_cart" as const },
    { label: "In product description", value: "description" as const },
    { label: "Custom position", value: "custom" as const },
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
        title: "Discount",
        description: "Set up discount rules and behavior",
    },
    {
        number: 3,
        title: "Appearance",
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
