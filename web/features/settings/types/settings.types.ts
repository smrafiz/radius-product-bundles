/**
 * Settings tab nav types
 */
import { ComponentType } from "react";

/**
 * Settings tab ids
 */
export type SettingsTabId =
    | "general"
    | "bundle_widget"
    | "customizer"
    | "discount"
    | "subscriptions"
    | "button_action"
    | "variant_selector"
    | "notifications"
    | "integrations"
    | "track_inventory"
    | "enable_online_shop"
    | "advanced"
    | "tools";

/**
 * Feature context for settings tabs
 */
export type FeatureContext = {
    isPro: boolean;
    hasOnlineStore: boolean;
    hasSubscriptions: boolean;
};

/**
 * Settings tab nav types
 */
export type SettingsTabNavInfo = {
    id: SettingsTabId;
    title: string;
    icon:
        | "settings"
        | "store-online"
        | "edit"
        | "discount"
        | "refresh"
        | "button"
        | "variant"
        | "apps"
        | "inventory"
        | "adjust"
        | "notification"
        | "dns-settings"
        | "wrench";
    component: ComponentType;
    visible?: (ctx: FeatureContext) => boolean;
};

/**
 * Global style settings applied to all bundles by default.
 */
export interface GlobalStyleSettings {
    colors: {
        primary: string; // Button, accents
        secondary: string; // Secondary actions
        background: string; // Widget background
        surface: string; // Card backgrounds
        border: string; // Borders
        text: {
            primary: string; // Main text
            secondary: string; // Muted text
            inverse: string; // Text on primary color
        };
        savings: string; // Savings badge
        error: string; // Error states
        success: string; // Success states
    };

    typography: {
        fontFamily: string; // "inherit" | "system-ui" | custom
        titleSize: "sm" | "md" | "lg" | "xl";
        bodySize: "sm" | "md" | "lg";
        fontWeight: {
            normal: number; // 400
            medium: number; // 500
            semibold: number; // 600
            bold: number; // 700
        };
    };

    spacing: {
        unit: number; // Base unit in px (default: 4)
        containerPadding: number;
        itemGap: number;
        sectionGap: number;
    };

    borders: {
        radius: {
            sm: number;
            md: number;
            lg: number;
            full: number; // For pills/circles
        };
        width: number;
    };

    shadows: {
        sm: string;
        md: string;
        lg: string;
    };

    button: {
        borderRadius: number;
        paddingX: number;
        paddingY: number;
        fontSize: string;
        fontWeight: number;
        textTransform: "none" | "uppercase" | "capitalize";
    };

    badge: {
        borderRadius: number;
        paddingX: number;
        paddingY: number;
        fontSize: string;
        fontWeight: number;
    };

    image: {
        borderRadius: number;
        aspectRatio: "1/1" | "4/3" | "3/4" | "auto";
        objectFit: "cover" | "contain";
    };
}

/**
 * Global labels for i18n support.
 */
export interface GlobalLabels {
    // Pricing
    regularPriceLabel: string; // "Regular Price:"
    bundlePriceLabel: string; // "Bundle Price:"
    youSaveLabel: string; // "You Save:"
    savingsText: string; // "Save {percent}%"

    // Buttons
    addToCartText: string; // "Add Bundle to Cart"
    addingText: string; // "Adding..."
    addedText: string; // "Added to Cart!"

    // Badges
    freeShippingText: string; // "Free Shipping"
    limitedOfferText: string; // "Limited Offer"
    bestSellerText: string; // "Best Seller"

    // Messages
    successMessage: string; // "Bundle added to cart!"
    errorMessage: string; // "Failed to add bundle"
    outOfStockText: string; // "Out of Stock"

    // Misc
    quantityLabel: string; // "Qty:"
    includesLabel: string; // "Includes:"
    plusSymbol: string; // "+"
}

/**
 * Bundle-specific style overrides.
 * Only include properties that differ from global.
 */
export interface StyleOverrides {
    colors?: Partial<GlobalStyleSettings["colors"]>;
    button?: Partial<GlobalStyleSettings["button"]>;
    badge?: Partial<GlobalStyleSettings["badge"]>;
    borders?: {
        radius?: Partial<GlobalStyleSettings["borders"]["radius"]>;
    };
    // Custom per-bundle overrides
    customProperties?: Record<string, string>;
}

/**
 * Widget behavior settings.
 */
export interface WidgetBehavior {
    showConfirmation: boolean;
    confirmationDuration: number;
    enableAnimations: boolean;
    animationType: "fade" | "slide" | "none";
}

/**
 * Responsive settings.
 */
export interface ResponsiveSettings {
    mobile: {
        layout: "LIST" | "GRID" | "SLIDER" | "COMPACT";
        columns: number;
        hideImages: boolean;
        compactMode: boolean;
    };
    tablet: {
        layout: "LIST" | "GRID" | "SLIDER" | "COMPACT";
        columns: number;
    };
    breakpoints: {
        mobile: number; // default: 480
        tablet: number; // default: 768
        desktop: number; // default: 1024
    };
}
