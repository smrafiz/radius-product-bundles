import {
    CustomizerStyles,
    DEFAULT_CUSTOMIZER_STYLES,
    DEFAULT_GLOBAL_STYLES,
    DEFAULT_LABELS,
    GlobalLabels,
    GlobalStyleSettings,
    resolveBreakpoints,
    ResponsiveSettings,
    StyleOverrides,
    WidgetBehavior,
} from "@/features/settings";
import type { AppSettings } from "@/prisma/generated/client";
import { PriorityType } from "@/features/bundles/constants/prisma-enums";

interface MetafieldGlobalSettings {
    // Required for Liquid rendering
    styles: CustomizerStyles;
    labels: Record<string, Record<string, string>>;
    primaryLocale: string;

    // Required for JS cart behavior
    cart: {
        redirectAfterCart: string;
        hidePaymentButtons: boolean;
        enableStockValidation: boolean;
        maxBundlesPerOrder: number;
        showSavingsBanner: boolean;
        allowDiscountStacking: boolean;
        lazyLoadImages: boolean;
        bundlePriorityType: string;
    };

    // Privacy settings
    privacy: {
        enableAnalytics: boolean;
    };

    // Required for custom styling
    custom: {
        cssClass: string;
        css: string;
    };

    // Plan gate — read by Liquid to enable Pro features
    isPro: boolean;
}

interface MetafieldBundleConfig {
    // Discount (for Rust function)
    status: string;
    discountType: string;
    discountValue: number;
    freeShipping: boolean;
    minOrderValue: number;
    maxDiscountAmount: number;
    discountApplication: string;
    discountedProductIds: string[];

    // Display (for Liquid)
    name: string;
    description: string;
    settings: {
        layout: string;
        title: string | null;
        buttonText: string | null;
        showPrices: boolean;
        showSavings: boolean;
        showImages: boolean;
        showDescription: boolean;
        showFreeShipping: boolean;
        enableProductLink: boolean;
        // Style overrides (only non-null values)
        styleOverrides: StyleOverrides | null;
        widgetBehavior: WidgetBehavior | null;
        responsive: ResponsiveSettings | null;
    };
}

/**
 * Type guard to check if an object matches the GlobalStyleSettings structure
 */
function isGlobalStyleSettings(obj: any): obj is GlobalStyleSettings {
    return (
        obj &&
        typeof obj === "object" &&
        "colors" in obj &&
        "typography" in obj &&
        "spacing" in obj &&
        "borders" in obj &&
        "shadows" in obj &&
        "button" in obj &&
        "badge" in obj &&
        "image" in obj
    );
}

function isRecord(value: unknown): value is Record<string, unknown> {
    return !!value && typeof value === "object" && !Array.isArray(value);
}

/**
 * Validates a flat labels object against DEFAULT_LABELS keys
 */
function validateFlatLabels(
    parsed: Record<string, unknown>,
): Partial<GlobalLabels> {
    const result: Partial<GlobalLabels> = {};
    for (const key of Object.keys(DEFAULT_LABELS) as Array<
        keyof GlobalLabels
    >) {
        const value = parsed[key];
        if (typeof value === "string" && value.trim() !== "") {
            result[key] = value;
        }
    }
    return result;
}

/**
 * Detects if labels are locale-keyed (e.g. { "en": {...}, "fr": {...} })
 * vs flat (e.g. { "headingLabel": "...", ... })
 */
function isLocaleKeyedLabels(obj: Record<string, unknown>): boolean {
    const keys = Object.keys(obj);
    if (keys.length === 0) return false;
    const firstKey = keys[0];
    return (
        firstKey.length <= 5 &&
        !firstKey.includes("Label") &&
        !firstKey.includes("Text")
    );
}

/**
 * Parses labels from DB and returns locale-keyed structure with defaults merged per locale.
 */
function getValidLocaleKeyedLabels(
    labels: unknown,
    primaryLocale: string,
): Record<string, Record<string, string>> {
    try {
        const parsed = typeof labels === "string" ? JSON.parse(labels) : labels;

        if (!isRecord(parsed)) {
            return { [primaryLocale]: { ...DEFAULT_LABELS } };
        }

        // Handle flat structure (legacy)
        if (!isLocaleKeyedLabels(parsed)) {
            const validated = validateFlatLabels(parsed);
            return {
                [primaryLocale]: { ...DEFAULT_LABELS, ...validated },
            };
        }

        // Handle locale-keyed structure
        const result: Record<string, Record<string, string>> = {};
        for (const [locale, localeLabels] of Object.entries(parsed)) {
            if (isRecord(localeLabels)) {
                const validated = validateFlatLabels(localeLabels);
                result[locale] = { ...DEFAULT_LABELS, ...validated };
            }
        }

        // Ensure primary locale exists
        if (!result[primaryLocale]) {
            result[primaryLocale] = { ...DEFAULT_LABELS };
        }

        return result;
    } catch {
        return { [primaryLocale]: { ...DEFAULT_LABELS } };
    }
}

/**
 * Safely parses and validates global styles from app settings
 */
function getValidGlobalStyles(styles: any): GlobalStyleSettings {
    try {
        // If it's already a valid GlobalStyleSettings, return it
        if (isGlobalStyleSettings(styles)) {
            return styles;
        }

        // If it's a string, try to parse it
        if (typeof styles === "string") {
            const parsed = JSON.parse(styles);
            if (isGlobalStyleSettings(parsed)) {
                return parsed;
            }
        }

        // If we get here, return default styles
        return DEFAULT_GLOBAL_STYLES;
    } catch (e) {
        return DEFAULT_GLOBAL_STYLES;
    }
}

/**
 * Builds global settings metafield value.
 * @param appSettings
 * @param primaryLocale - The store's primary locale code (from Shop.primaryLocale)
 */
export function buildGlobalSettingsMetafieldValue(
    appSettings: AppSettings | null,
    primaryLocale = "en",
    isPro = false,
): string {
    const mergedStyles: CustomizerStyles = {
        ...DEFAULT_CUSTOMIZER_STYLES,
        ...(appSettings?.globalStyles
            ? getValidCustomizerStyles(appSettings.globalStyles)
            : {}),
    };

    const bp = resolveBreakpoints(mergedStyles);
    mergedStyles.tabletBreakpoint = bp.tablet;
    mergedStyles.mobileBreakpoint = bp.mobile;

    const settings: MetafieldGlobalSettings = {
        // Styles for Liquid
        styles: mergedStyles,

        // Labels for Liquid — locale-keyed with defaults merged per locale
        labels: getValidLocaleKeyedLabels(appSettings?.labels, primaryLocale),
        primaryLocale,

        // Cart behavior for JS
        cart: {
            redirectAfterCart: appSettings?.redirectAfterCart || "default",
            hidePaymentButtons: appSettings?.hidePaymentButtons ?? false,
            enableStockValidation: appSettings?.enableStockValidation ?? true,
            maxBundlesPerOrder: appSettings?.maxBundlesPerOrder ?? 0,
            showSavingsBanner: appSettings?.showSavingsBanner ?? false,
            allowDiscountStacking: appSettings?.allowDiscountStacking ?? false,
            lazyLoadImages: appSettings?.lazyLoadImages ?? true,
            bundlePriorityType:
                appSettings?.bundlePriorityType ?? PriorityType.INDEX_BASED,
        },

        // Privacy settings
        privacy: {
            enableAnalytics: appSettings?.enableAnalytics ?? true,
        },

        // Custom CSS for Liquid
        custom: {
            cssClass: appSettings?.customCssClass || "",
            css: appSettings?.customCss || "",
        },
        isPro,
    };

    return JSON.stringify(settings);
}

/**
 * Deep merge utility.
 */
function mergeDeep<T extends object>(target: T, source: Partial<T>): T {
    const result = { ...target };

    for (const key in source) {
        if (source[key] !== undefined && source[key] !== null) {
            if (
                typeof source[key] === "object" &&
                !Array.isArray(source[key]) &&
                source[key] !== null
            ) {
                result[key] = mergeDeep(
                    (target[key] as object) || {},
                    source[key] as object,
                ) as T[Extract<keyof T, string>];
            } else {
                result[key] = source[key] as T[Extract<keyof T, string>];
            }
        }
    }

    return result;
}

/**
 * Validates and returns CustomizerStyles from appSettings.
 */
function getValidCustomizerStyles(styles: unknown): Partial<CustomizerStyles> {
    try {
        const parsed = typeof styles === "string" ? JSON.parse(styles) : styles;

        if (!parsed || typeof parsed !== "object") {
            return {};
        }

        /**
         * Valid style tokens based on the CURRENT Style Customizer
         */
        const validKeys: (keyof CustomizerStyles)[] = [
            // Preset
            "stylePreset",

            // Appearance
            "primaryColor",
            "textColor",
            "backgroundColor",
            "borderColor",
            "savingsColor",
            "cornerStyle",
            "shadow",
            "spacing",

            // Product cards
            "imageSize",
            "imageFit",
            "imagePosition",
            "customizeCardStyle",
            "productCardBg",
            "productCardBorder",
            "productCardShadow",

            // Button & Badge
            "buttonStyle",
            "buttonSize",
            "buttonWidth",
            "buttonBgColor",
            "badgePosition",
            "badgeStyle",

            // Pricing summary
            "pricingSummaryBox",
            "pricingSummaryBg",
            "pricingSummaryStyle",

            // Advanced – Container
            "boxMaxWidth",
            "boxAlignment",
            "showBorder",

            // Advanced – Typography
            "headingSize",
            "bodySize",

            // Layout-specific
            "dividerStyle", // LIST
            "gridColumns", // GRID
            "slidesPerView", // CAROUSEL
            "carouselNavigation",
            "autoplay",
            "autoplaySpeed",

            // Bundle-type specific
            "bogoFreeTagColor",
            "bogoCardBorderStyle",
            "splitDealStyle",
            "mixMatchGroupHeaderColor",
            "mixMatchSelectionStyle",
            "fbtSeparatorStyle",
            "fbtCheckboxColor",

            // Cart Banner
            "cartBannerTextColor",
            "cartBannerBgColor",
            "cartBannerBorderColor",
            "cartBannerHighlightColor",
            "cartBannerBorderStyle",
            "cartBannerCornerStyle",
            "cartBannerShadow",
            "cartBannerSpacing",
            "cartBannerBodySize",
            "cartBannerIconType",
            "cartBannerIconColor",

            // Breakpoints
            "breakpointPreset",
            "customBreakpoints",
            "tabletBreakpoint",
            "mobileBreakpoint",
        ];

        const result: Partial<CustomizerStyles> = {};

        for (const key of validKeys) {
            if (
                key in parsed &&
                parsed[key] !== undefined &&
                parsed[key] !== null
            ) {
                result[key] = parsed[key];
            }
        }

        for (const device of ["mobile", "tablet"] as const) {
            if (device in parsed && isRecord(parsed[device])) {
                const deviceOverrides: Partial<CustomizerStyles> = {};
                for (const key of validKeys) {
                    if (
                        key in (parsed[device] as Record<string, unknown>) &&
                        key !== ("mobile" as keyof CustomizerStyles) &&
                        key !== ("tablet" as keyof CustomizerStyles)
                    ) {
                        (deviceOverrides as any)[key] = (
                            parsed[device] as Record<string, unknown>
                        )[key];
                    }
                }
                if (Object.keys(deviceOverrides).length > 0) {
                    (result as any)[device] = deviceOverrides;
                }
            }
        }

        // Per-bundle-type overrides
        if (
            "bundleTypeOverrides" in parsed &&
            isRecord(parsed.bundleTypeOverrides)
        ) {
            const knownTypes = [
                "FIXED_BUNDLE",
                "BOGO",
                "BUY_X_GET_Y",
                "VOLUME_DISCOUNT",
                "MIX_AND_MATCH",
                "FREQUENTLY_BOUGHT_TOGETHER",
            ];
            const typeOverrides: Record<string, Partial<CustomizerStyles>> = {};

            for (const type of knownTypes) {
                if (
                    type in
                        (parsed.bundleTypeOverrides as Record<
                            string,
                            unknown
                        >) &&
                    isRecord((parsed.bundleTypeOverrides as any)[type])
                ) {
                    const typeMap = (parsed.bundleTypeOverrides as any)[
                        type
                    ] as Record<string, unknown>;
                    const filtered: Partial<CustomizerStyles> = {};
                    for (const key of validKeys) {
                        if (
                            key in typeMap &&
                            typeMap[key] !== undefined &&
                            typeMap[key] !== null
                        ) {
                            (filtered as any)[key] = typeMap[key];
                        }
                    }
                    if (Object.keys(filtered).length > 0) {
                        typeOverrides[type] = filtered;
                    }
                }
            }

            if (Object.keys(typeOverrides).length > 0) {
                (result as any).bundleTypeOverrides = typeOverrides;
            }
        }

        return result;
    } catch {
        return {};
    }
}
