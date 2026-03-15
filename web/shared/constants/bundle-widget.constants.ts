import { PreviewProduct, WidgetDisplayOptions, WidgetLabels, WidgetPricing } from "@/shared";

export const PREVIEW_LABELS: WidgetLabels = {
    headingLabel: "Bundle & Save",
    addToCartText: "Add Bundle to Cart",
    quantityLabel: "Qty:",
    regularPriceLabel: "Regular Price:",
    bundlePriceLabel: "Bundle Price:",
    youSaveLabel: "You Save:",
    freeShippingLabel: "Free Shipping",
    bogoFreeText: "FREE",
    bogoYouPayLabel: "You Pay:",
    bogoYouSaveLabel: "You Save:",
    bogoTotalLabel: "Bundle Total:",
    bogoSaveText: "You Save:",
};

export const PLACEHOLDER_PRODUCTS: PreviewProduct[] = [
    {
        id: "p-1",
        title: "Bundle product",
        price: "$300.33",
        compareAtPrice: "$600.00",
        quantity: 1,
    },
    {
        id: "p-2",
        title: "Bundle product",
        price: "$300.33",
        compareAtPrice: "$600.00",
        quantity: 1,
    },
    {
        id: "p-3",
        title: "Bundle product",
        price: "$300.33",
        compareAtPrice: "$600.00",
        quantity: 1,
    },
    {
        id: "p-4",
        title: "Bundle product",
        price: "$300.33",
        compareAtPrice: "$600.00",
        quantity: 1,
    },
    {
        id: "p-5",
        title: "Bundle product",
        price: "$300.33",
        compareAtPrice: "$600.00",
        quantity: 1,
    },
];

export const DEFAULT_DISPLAY_OPTIONS: WidgetDisplayOptions = {
    showImages: true,
    showPrices: true,
    showComparePrices: true,
    showQuantity: true,
    showSavingsBadge: true,
    showSavings: true,
    showFreeShipping: true,
    enableHyperLink: false,
};

export const PLACEHOLDER_PRICING: WidgetPricing = {
    originalPrice: "$2,899.96",
    finalPrice: "$1,899.96",
    savingsAmount: "$474.99",
    savingsPercentage: 20,
    hasDiscount: true,
};
