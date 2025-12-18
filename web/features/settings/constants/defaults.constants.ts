import {
    GlobalLabels,
    GlobalStyleSettings,
    ResponsiveSettings,
    WidgetBehavior,
} from "@/features/settings";

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

export const DEFAULT_GLOBAL_LABELS: GlobalLabels = {
    regularPriceLabel: "Regular Price:",
    bundlePriceLabel: "Bundle Price:",
    youSaveLabel: "You Save:",
    savingsText: "Save {percent}%",
    addToCartText: "Add Bundle to Cart",
    addingText: "Adding...",
    addedText: "Added!",
    freeShippingText: "Free Shipping",
    successMessage: "Bundle added to cart!",
    errorMessage: "Failed to add bundle",
    outOfStockText: "Out of Stock",
    quantityLabel: "Qty:",
    limitedOfferText: "Limited Offer",
    bestSellerText: "Best Seller",
    includesLabel: "Includes:",
    plusSymbol: "+",
};

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
