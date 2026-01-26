/*
 * Bundle details constants
 */

/*
 * Maps form fields to their corresponding step numbers.
 */
export const BUNDLE_STEP_FIELD_MAP: Record<string, number> = {
    // Step 1: Products
    name: 1,
    products: 1,

    // Step 2: Discount/Configuration
    discountType: 2,
    discountValue: 2,
    minOrderValue: 2,
    maxDiscountAmount: 2,
    discountApplication: 2,
    freeShipping: 2,

    // Step 3: Display/Bundle as Product
    createProduct: 3,
    productTitle: 3,
    productDescription: 3,
};

export const WIDGET_LAYOUTS = [
    {
        label: "Grid",
        value: "GRID" as const,
        widgetLayout: "/assets/widget-grid-layout.png",
    },
    {
        label: "List",
        value: "LIST" as const,
        widgetLayout: "/assets/widget-list-layout.png",
    },
    {
        label: "Slider",
        value: "CAROUSEL" as const,
        widgetLayout: "/assets/widget-carousel-layout.png",
    },
    {
        label: "Compact",
        value: "COMPACT" as const,
        widgetLayout: "/assets/widget-compact-layout.png",
    },
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
        key: "showImages" as const,
        title: "Display product images",
        description:
            "Show product images for each item included in the bundle.",
    },
    {
        key: "showSavingsBadge" as const,
        title: "Display savings badge",
        description: "Highlight savings with a badge on eligible bundle items.",
    },
    {
        key: "showPrices" as const,
        title: "Display individual product prices",
        description: "Show the price of each product included in the bundle.",
    },
    {
        key: "showComparePrices" as const,
        title: "Display compare-at prices",
        description:
            "Show the original (compare-at) price alongside the current price.",
    },
    {
        key: "showQuantity" as const,
        title: "Display product quantities",
        description:
            "Show the quantity of each product included in the bundle.",
    },
    {
        key: "showSavings" as const,
        title: "Display total bundle savings",
        description:
            "Show the total amount customers save when purchasing the bundle.",
    },
    {
        key: "showFreeShipping" as const,
        title: "Display free shipping message",
        description:
            "Inform customers when the bundle qualifies for free shipping.",
    },
    {
        key: "enableHyperLink" as const,
        title: "Enable product page link",
        description: "Link product titles to their respective product pages.",
    },
];
