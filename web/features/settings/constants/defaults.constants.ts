import {
    AppSettings,
    AppSettingsFormData,
    AppSettingsGlobalStyles,
    AppSettingsLabels,
    getDefaultValuesFromConfig,
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
 * Auto-generated default values from config files.
 */
export const APP_SETTINGS = {
    ...getDefaultValuesFromConfig(),
    // Add complex objects not defined in simple config fields
    globalStyles: GLOBAL_STYLES,
};
