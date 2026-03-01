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
    "settings.title": 3,
    "settings.cartButtonText": 3,

    priority: 4,
};

export const BUNDLE_FIELD_LABELS: Record<string, string> = {
    name: "Bundle Name",
    products: "Products",
    discountType: "Discount Type",
    discountValue: "Discount Value",
    minOrderValue: "Minimum Order Value",
    maxDiscountAmount: "Maximum Discount",
    discountApplication: "Discount Application",
    freeShipping: "Free Shipping",
    createProduct: "Create Product",
    productTitle: "Product Title",
    productDescription: "Product Description",
    "settings.title": "Offer Title",
    "settings.cartButtonText": "Cart Button Text",
    settings: "Display Settings",
    priority: "Priority",
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

export const BOGO_LAYOUTS = [
    {
        label: "Classic Card",
        value: "CLASSIC_CARD" as const,
        widgetLayout: "/assets/widget-classic-card-layout.png",
    },
    {
        label: "Compact Grid",
        value: "COMPACT_GRID" as const,
        widgetLayout: "/assets/widget-compact-grid-layout.png",
    },
    {
        label: "Minimalist",
        value: "MINIMALIST" as const,
        widgetLayout: "/assets/widget-minimalist-layout.png",
    },
    {
        label: "Sleek",
        value: "SLEEK" as const,
        widgetLayout: "/assets/widget-sleek-layout.png",
    },
];

export const LAYOUTS_BY_BUNDLE_TYPE: Record<
    string,
    typeof WIDGET_LAYOUTS | typeof BOGO_LAYOUTS
> = {
    FIXED_BUNDLE: WIDGET_LAYOUTS,
    BOGO: BOGO_LAYOUTS,
    BUY_X_GET_Y: BOGO_LAYOUTS,
};

export const BOGO_LAYOUT_VALUES = [
    "CLASSIC_CARD",
    "COMPACT_GRID",
    "MINIMALIST",
    "SLEEK",
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
