/*
 * Bundle details constants
 */

export const WIDGET_LAYOUTS = [
    {
        label: "Grid",
        value: "GRID" as const,
        widgetLayout: "/assets/widget-grid-layout.png",
    },
    {
        label: "List",
        value: "LIST" as const,
        widgetLayout: "/assets/widget-horizontal-layout.png",
    },
    {
        label: "Slider",
        value: "CAROUSEL" as const,
        widgetLayout: "/assets/widget-vertical-layout.png",
    },
    {
        label: "Compact",
        value: "COMPACT" as const,
        widgetLayout: "/assets/widget-vertical-layout.png",
    },
];

export const WIDGET_POSITIONS = [
    { label: "Above add to cart", value: "ABOVE_ADD_TO_CART" as const },
    { label: "Below add to cart", value: "BELOW_ADD_TO_CART" as const },
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
        key: "enableHyperLink" as const,
        title: "Enable product page link",
        description:
            "Add linked titles to the individual product pages of the bundle",
    },
];
