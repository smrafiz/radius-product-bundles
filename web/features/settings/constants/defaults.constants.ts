import {
    AppSettings,
    AppSettingsFormData,
    AppSettingsGlobalStyles,
    AppSettingsLabels,
    GlobalLabels,
    GlobalStyleSettings,
    ResponsiveSettings,
    WidgetBehavior,
} from "@/features/settings";
import { DiscountType } from "@/features/bundles";

/**
 * Defaults
 */
export const DEFAULT_GLOBAL_STYLES: GlobalStyleSettings = {
    colors: {
        primary: "#333333",
        secondary: "#666666",
        background: "#ffffff",
        surface: "#f9f9f9",
        border: "#e1e1e1",
        text: {
            primary: "#333333",
            secondary: "#666666",
            inverse: "#ffffff",
        },
        savings: "#22c55e",
        error: "#dc2626",
        success: "#22c55e",
    },
    typography: {
        fontFamily: "inherit",
        titleSize: "md",
        bodySize: "md",
        fontWeight: {
            normal: 400,
            medium: 500,
            semibold: 600,
            bold: 700,
        },
    },
    spacing: {
        unit: 4,
        containerPadding: 24,
        itemGap: 16,
        sectionGap: 24,
    },
    borders: {
        radius: {
            sm: 4,
            md: 8,
            lg: 12,
            full: 9999,
        },
        width: 1,
    },
    shadows: {
        sm: "0 1px 2px rgba(0,0,0,0.05)",
        md: "0 2px 8px rgba(0,0,0,0.08)",
        lg: "0 4px 16px rgba(0,0,0,0.12)",
    },
    button: {
        borderRadius: 8,
        paddingX: 24,
        paddingY: 14,
        fontSize: "1rem",
        fontWeight: 600,
        textTransform: "none",
    },
    badge: {
        borderRadius: 20,
        paddingX: 12,
        paddingY: 4,
        fontSize: "0.875rem",
        fontWeight: 600,
    },
    image: {
        borderRadius: 8,
        aspectRatio: "1/1",
        objectFit: "cover",
    },
};

// export const DEFAULT_GLOBAL_LABELS: GlobalLabels = {
//     regularPriceLabel: "Regular Price:",
//     bundlePriceLabel: "Bundle Price:",
//     youSaveLabel: "You Save:",
//     savingsText: "Save {percent}%",
//     addToCartText: "Add Bundle to Cart",
//     addingText: "Adding...",
//     addedText: "Added!",
//     freeShippingText: "Free Shipping",
//     successMessage: "Bundle added to cart!",
//     errorMessage: "Failed to add bundle",
//     outOfStockText: "Out of Stock",
//     quantityLabel: "Qty:",
//     limitedOfferText: "Limited Offer",
//     bestSellerText: "Best Seller",
//     includesLabel: "Includes:",
//     plusSymbol: "+",
// };

export const DEFAULT_WIDGET_BEHAVIOR: WidgetBehavior = {
    showConfirmation: true,
    confirmationDuration: 3000,
    enableAnimations: true,
    animationType: "fade",
};

export const DEFAULT_RESPONSIVE_SETTINGS: ResponsiveSettings = {
    mobile: {
        layout: "LIST",
        columns: 1,
        hideImages: false,
        compactMode: false,
    },
    tablet: {
        layout: "GRID",
        columns: 2,
    },
    breakpoints: {
        mobile: 480,
        tablet: 768,
        desktop: 1024,
    },
};

/**
 * Default labels for bundle widgets
 */
export const DEFAULT_LABELS = {
    // Widget Text
    headingLabel: "Bundle & Save",
    addToCartText: "Add Bundle to Cart",
    quantityLabel: "Qty:",

    // Button States
    addingText: "Adding...",
    addedText: "Added!",
    outOfStockText: "Out of Stock",

    // Price Labels
    regularPriceLabel: "Regular Price:",
    bundlePriceLabel: "Bundle Price:",
    youSaveLabel: "You Save:",
    savingsBadgeText: "Save {percent}%",

    // Shipping Labels
    freeShippingLabel: "Free Shipping",
    freeShippingMethodTitle: "Free Shipping",
} as const;

/**
 * Default global styles for bundle widgets
 */
export const GLOBAL_STYLES = {
    colors: {
        primary: "#000000",
        secondary: "#666666",
        background: "#ffffff",
        innerBackground: "#f9f9f9",
        border: "#e5e5e5",
        heading: "#000000",
        text: "#333333",
        button: "#000000",
        buttonText: "#ffffff",
        buttonHover: "#333333",
        savings: "#22c55e",
        savingsText: "#ffffff",
    },
    typography: {
        headingSize: "md" as const,
        headingTransform: "none" as const,
        textSize: "md" as const,
    },
    button: {
        size: "md" as const,
        borderRadius: 4,
    },
    badge: {
        size: "md" as const,
        borderRadius: 4,
        fontSize: "12px",
    },
    product: {
        background: "#ffffff",
        text: "#333333",
        border: "#e5e5e5",
        borderRadius: 4,
        fontSize: "14px",
    },
    image: {
        size: "md" as const,
        borderRadius: 4,
        fit: "cover" as const,
    },
    box: {
        background: "#ffffff",
        border: "#e5e5e5",
        borderRadius: 8,
    },
} as const;

/**
 * Default app settings values
 */
export const APP_SETTINGS: AppSettingsFormData = {
    // General - Defaults
    defaultDiscountType: "PERCENTAGE",
    defaultDiscountValue: 10,
    maxBundleProducts: 10,
    maxBundlesPerShop: 5,

    // General - Cart Behavior
    redirectAfterCart: "cart",
    hidePaymentButtons: false,
    enableStockValidation: true,

    // General - Discount
    discountTitle: "Bundle Discount",
    trackOrdersWithoutDiscount: true,

    // General - Localization
    currencyDisplay: "store",
    disableCartLocale: false,

    // Labels
    labels: DEFAULT_LABELS,

    // Style
    globalStyles: GLOBAL_STYLES,

    // Advanced
    currencyFormat: "",
    customCssClass: "",
    customCss: "",
};

/**
 * Redirect after cart options
 */
export const REDIRECT_AFTER_CART_OPTIONS = [
    { value: "cart", label: "Cart page" },
    { value: "checkout", label: "Checkout" },
    { value: "none", label: "Stay on page (no redirect)" },
    { value: "drawer", label: "Open cart drawer" },
] as const;

/**
 * Currency display options
 */
export const CURRENCY_DISPLAY_OPTIONS = [
    { value: "store", label: "Use store default" },
    { value: "code", label: "Always show currency code (e.g., USD)" },
    { value: "symbol", label: "Always show symbol (e.g., $)" },
] as const;
