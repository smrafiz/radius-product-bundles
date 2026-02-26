import {
    BreakpointPreset,
    CustomizerStyles,
    getDefaultValuesFromConfig,
    GlobalStyleSettings,
    ResponsiveSettings,
    StylePresetsMap,
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
    savingsBadgeText: "Save {amount}",

    // Shipping Labels
    freeShippingLabel: "Free Shipping",
    freeShippingMethodTitle: "Free shipping with {name}",

    // Cart Limits
    maxBundlesReachedText: "Maximum {count} bundle(s) per order allowed",

    // BOGO Labels
    bogoYouPayLabel: "You Pay Only",
    bogoYouSaveLabel: "You Save",
    bogoTriggerBadgeText: "You Buy",
    bogoRewardBadgeText: "You Get FREE",

    // Cart Banner
    bannerSavingText: "You're saving {discount} with {name}",
    bannerCustomPriceText: "Special price: {price} for {name}",
    bannerFreeShippingQualifyText: "{name} qualifies for free shipping!",
    bannerFreeShippingText: "Free shipping included!",
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

/**
 * Maps breakpoint presets to pixel values.
 */
export const BREAKPOINT_PRESET_VALUES: Record<
    BreakpointPreset,
    { tablet: number; mobile: number }
> = {
    standard: { tablet: 1024, mobile: 768 },
    compact: { tablet: 960, mobile: 640 },
    wide: { tablet: 1200, mobile: 768 },
} as const;

/**
 * Default customizer styles
 */
export const DEFAULT_CUSTOMIZER_STYLES: CustomizerStyles = {
    // ═══════════════════════════════════════════════════════════════════
    // PRESET
    // ═══════════════════════════════════════════════════════════════════
    stylePreset: "minimal",
    // ═══════════════════════════════════════════════════════════════════
    // APPEARANCE - COLORS
    // ═══════════════════════════════════════════════════════════════════
    primaryColor: "#303030",
    textColor: "#333333",
    backgroundColor: "#ffffff",
    borderColor: "#e5e7eb",
    savingsColor: "#16a34a",

    // ═══════════════════════════════════════════════════════════════════
    // APPEARANCE - SHAPE & DEPTH
    // ═══════════════════════════════════════════════════════════════════
    cornerStyle: "modern",
    shadow: "soft",
    spacing: "comfortable",

    // ═══════════════════════════════════════════════════════════════════
    // PRODUCT CARDS
    // ═══════════════════════════════════════════════════════════════════
    customizeCardStyle: false,
    productCardBg: "#f9fafb",
    productCardBorder: true,
    productCardShadow: false,
    imageSize: "medium",
    imageFit: "cover",
    imagePosition: "left",

    // ═══════════════════════════════════════════════════════════════════
    // BUTTON
    // ═══════════════════════════════════════════════════════════════════
    buttonStyle: "filled",
    buttonSize: "medium",
    buttonWidth: "full",
    buttonBgColor: "",

    // ═══════════════════════════════════════════════════════════════════
    // BADGE
    // ═══════════════════════════════════════════════════════════════════
    badgePosition: "top-right",
    badgeStyle: "filled",

    // ═══════════════════════════════════════════════════════════════════
    // PRICING SUMMARY
    // ═══════════════════════════════════════════════════════════════════
    pricingSummaryBox: true,
    pricingSummaryBg: "#f9fafb",
    pricingSummaryStyle: "card",

    // ═══════════════════════════════════════════════════════════════════
    // ADVANCED - CONTAINER
    // ═══════════════════════════════════════════════════════════════════
    boxMaxWidth: 600,
    boxAlignment: "center",
    showBorder: true,

    // ═══════════════════════════════════════════════════════════════════
    // ADVANCED - TYPOGRAPHY
    // ═══════════════════════════════════════════════════════════════════
    headingSize: "medium",
    bodySize: "medium",

    // ═══════════════════════════════════════════════════════════════════
    // ADVANCED - LIST LAYOUT
    // ═══════════════════════════════════════════════════════════════════
    dividerStyle: "plus",

    // ═══════════════════════════════════════════════════════════════════
    // ADVANCED - GRID LAYOUT
    // ═══════════════════════════════════════════════════════════════════
    gridColumns: 3,

    // ═══════════════════════════════════════════════════════════════════
    // ADVANCED - CAROUSEL LAYOUT
    // ═══════════════════════════════════════════════════════════════════
    slidesPerView: 3,
    carouselNavigation: "both",
    autoplay: false,
    autoplaySpeed: 5,

    // ═══════════════════════════════════════════════════════════════════
    // ADVANCED - BOGO SPECIFIC
    // ═══════════════════════════════════════════════════════════════════
    bogoFreeTagColor: "#16a34a",
    bogoCardBorderStyle: "solid",

    // ═══════════════════════════════════════════════════════════════════
    // ADVANCED - BUY X GET Y SPECIFIC
    // ═══════════════════════════════════════════════════════════════════
    buyGetTierStyle: "cards",

    // ═══════════════════════════════════════════════════════════════════
    // ADVANCED - VOLUME DISCOUNT SPECIFIC
    // ═══════════════════════════════════════════════════════════════════
    volumeTierHighlightColor: "#303030",
    volumeTierStyle: "table",

    // ═══════════════════════════════════════════════════════════════════
    // ADVANCED - MIX & MATCH SPECIFIC
    // ═══════════════════════════════════════════════════════════════════
    mixMatchGroupHeaderColor: "#303030",
    mixMatchSelectionStyle: "checkbox",

    // ═══════════════════════════════════════════════════════════════════
    // ADVANCED - FREQUENTLY BOUGHT TOGETHER SPECIFIC
    // ═══════════════════════════════════════════════════════════════════
    fbtSeparatorStyle: "plus",
    fbtCheckboxColor: "#303030",

    // ═══════════════════════════════════════════════════════════════════
    // CART BANNER SPECIFIC
    // ═══════════════════════════════════════════════════════════════════
    cartBannerTextColor: "#333333",
    cartBannerBgColor: "#ffffff",
    cartBannerBorderColor: "#303030",
    cartBannerHighlightColor: "#303030",
    cartBannerBorderStyle: "solid",
    cartBannerCornerStyle: "modern",
    cartBannerShadow: "none",
    cartBannerSpacing: "comfortable",
    cartBannerBodySize: "medium",
    cartBannerIconType: "tag",
    cartBannerIconColor: "#303030",

    // ═══════════════════════════════════════════════════════════════════
    // ADVANCED - BREAKPOINTS
    // ═══════════════════════════════════════════════════════════════════
    breakpointPreset: "standard",
    customBreakpoints: false,
    tabletBreakpoint: 1024,
    mobileBreakpoint: 768,
};

/**
 * Style presets for quick theme application.
 *
 * Each preset provides a cohesive look that merchants
 * can apply with one click, then customize further.
 */
export const STYLE_PRESETS: StylePresetsMap = {
    minimal: {
        name: "Minimal",
        description: "Clean and simple with sharp edges",
        preview: {
            primary: "#000000",
            background: "#ffffff",
            accent: "#f3f4f6",
        },
        values: {
            primaryColor: "#000000",
            textColor: "#1f2937",
            backgroundColor: "#ffffff",
            borderColor: "#e5e7eb",
            savingsColor: "#059669",
            cornerStyle: "sharp",
            shadow: "none",
            spacing: "comfortable",
            productCardBorder: false,
            productCardShadow: false,
            buttonStyle: "filled",
        },
    },
    soft: {
        name: "Soft",
        description: "Gentle curves with subtle depth",
        preview: {
            primary: "#6366f1",
            background: "#f9fafb",
            accent: "#eef2ff",
        },
        values: {
            primaryColor: "#6366f1",
            textColor: "#374151",
            backgroundColor: "#f9fafb",
            borderColor: "#e5e7eb",
            savingsColor: "#10b981",
            cornerStyle: "modern",
            shadow: "soft",
            spacing: "comfortable",
            productCardBorder: true,
            productCardShadow: false,
            buttonStyle: "filled",
        },
    },
    bold: {
        name: "Bold",
        description: "High contrast and attention-grabbing",
        preview: {
            primary: "#dc2626",
            background: "#ffffff",
            accent: "#fef2f2",
        },
        values: {
            primaryColor: "#dc2626",
            textColor: "#111827",
            backgroundColor: "#ffffff",
            borderColor: "#fecaca",
            savingsColor: "#dc2626",
            cornerStyle: "rounded",
            shadow: "strong",
            spacing: "spacious",
            productCardBorder: true,
            productCardShadow: true,
            buttonStyle: "filled",
        },
    },
    elegant: {
        name: "Elegant",
        description: "Sophisticated with refined details",
        preview: {
            primary: "#7c3aed",
            background: "#faf5ff",
            accent: "#ede9fe",
        },
        values: {
            primaryColor: "#7c3aed",
            textColor: "#1e1b4b",
            backgroundColor: "#faf5ff",
            borderColor: "#ddd6fe",
            savingsColor: "#7c3aed",
            cornerStyle: "modern",
            shadow: "soft",
            spacing: "spacious",
            productCardBorder: false,
            productCardShadow: true,
            buttonStyle: "filled",
        },
    },
    dark: {
        name: "Dark",
        description: "Sleek dark theme with vibrant accents",
        preview: {
            primary: "#22d3ee",
            background: "#1f2937",
            accent: "#374151",
        },
        values: {
            primaryColor: "#22d3ee",
            textColor: "#f9fafb",
            backgroundColor: "#1f2937",
            borderColor: "#4b5563",
            savingsColor: "#34d399",
            cornerStyle: "modern",
            shadow: "strong",
            spacing: "comfortable",
            productCardBorder: true,
            productCardShadow: false,
            buttonStyle: "filled",
            pricingSummaryBg: "#D2B2B212",
        },
    },
    nature: {
        name: "Nature",
        description: "Earthy tones with organic feel",
        preview: {
            primary: "#059669",
            background: "#f0fdf4",
            accent: "#dcfce7",
        },
        values: {
            primaryColor: "#059669",
            textColor: "#14532d",
            backgroundColor: "#f0fdf4",
            borderColor: "#bbf7d0",
            savingsColor: "#059669",
            cornerStyle: "rounded",
            shadow: "soft",
            spacing: "comfortable",
            productCardBorder: false,
            productCardShadow: false,
            buttonStyle: "filled",
        },
    },
    warm: {
        name: "Warm",
        description: "Inviting warm tones that feel friendly and human",
        preview: {
            primary: "#f97316",
            background: "#fff7ed",
            accent: "#ffedd5",
        },
        values: {
            primaryColor: "#f97316",
            textColor: "#431407",
            backgroundColor: "#fff7ed",
            borderColor: "#fed7aa",
            savingsColor: "#ea580c",
            cornerStyle: "rounded",
            shadow: "soft",
            spacing: "comfortable",
            productCardBorder: false,
            productCardShadow: true,
            buttonStyle: "filled",
        },
    },
    professional: {
        name: "Professional",
        description: "Neutral, structured, and trust-focused",
        preview: {
            primary: "#2563eb",
            background: "#f8fafc",
            accent: "#e5e7eb",
        },
        values: {
            primaryColor: "#2563eb",
            textColor: "#1f2937",
            backgroundColor: "#f8fafc",
            borderColor: "#d1d5db",
            savingsColor: "#2563eb",
            cornerStyle: "modern",
            shadow: "none",
            spacing: "comfortable",
            productCardBorder: true,
            productCardShadow: false,
            buttonStyle: "outline",
        },
    },
};

/**
 * Maps corner style presets to pixel values.
 */
export const CORNER_STYLE_VALUES = {
    sharp: 0,
    modern: 8,
    rounded: 20,
} as const;

/**
 * Maps shadow presets to CSS values.
 */
export const SHADOW_VALUES = {
    none: "none",
    soft: "0 2px 8px rgba(0, 0, 0, 0.08)",
    strong: "0 4px 16px rgba(0, 0, 0, 0.15)",
} as const;

/**
 * Maps spacing presets to pixel values.
 */
export const SPACING_VALUES = {
    compact: { padding: 12, gap: 8 },
    comfortable: { padding: 20, gap: 12 },
    spacious: { padding: 28, gap: 16 },
} as const;

/**
 * Maps image size presets to pixel values.
 */
export const IMAGE_SIZE_VALUES = {
    small: 60,
    medium: 80,
    large: 120,
} as const;

/**
 * Maps text size presets to pixel values.
 */
export const TEXT_SIZE_VALUES = {
    small: { heading: 16, body: 14 },
    medium: { heading: 20, body: 16 },
    large: { heading: 24, body: 18 },
} as const;

/**
 * Maps button size presets to styles.
 */
export const BUTTON_SIZE_VALUES = {
    small: { padding: "8px 16px", fontSize: 14 },
    medium: { padding: "12px 24px", fontSize: 16 },
    large: { padding: "16px 32px", fontSize: 18 },
} as const;
