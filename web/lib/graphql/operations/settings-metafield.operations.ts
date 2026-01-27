import {
    CustomizerStyles,
    DEFAULT_CUSTOMIZER_STYLES,
    DEFAULT_GLOBAL_STYLES,
    DEFAULT_LABELS,
    GlobalLabels,
    GlobalStyleSettings,
    ResponsiveSettings,
    StyleOverrides,
    WidgetBehavior,
} from "@/features/settings";
import { AppSettings } from "@/prisma/generated/client";

interface MetafieldGlobalSettings {
    // Required for Liquid rendering
    styles: CustomizerStyles;
    labels: GlobalLabels;

    // Required for JS cart behavior
    cart: {
        redirectAfterCart: string;
        hidePaymentButtons: boolean;
        disableCartLocale: boolean;
    };

    // Required for custom styling
    custom: {
        cssClass: string;
        css: string;
    };

    // Optional: currency formatting
    currency?: {
        display: string;
        format: string;
    };
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

function getValidGlobalLabels(labels: unknown): Partial<GlobalLabels> {
    try {
        const parsed = typeof labels === "string" ? JSON.parse(labels) : labels;

        if (!parsed || typeof parsed !== "object") {
            return {};
        }

        const result: Partial<GlobalLabels> = {};

        for (const key of Object.keys(DEFAULT_LABELS) as Array<
            keyof GlobalLabels
        >) {
            const value = parsed[key];
            if (typeof value === "string") {
                result[key] = value;
            }
        }

        return result;
    } catch {
        return {};
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
 */
export function buildGlobalSettingsMetafieldValue(
    appSettings: AppSettings | null,
): string {
    const settings: MetafieldGlobalSettings = {
        // Styles for Liquid
        styles: {
            ...DEFAULT_CUSTOMIZER_STYLES,
            ...(appSettings?.globalStyles
                ? getValidCustomizerStyles(appSettings.globalStyles)
                : {}),
        },

        // Labels for Liquid
        labels: {
            ...DEFAULT_LABELS,
            ...(appSettings?.labels
                ? getValidGlobalLabels(appSettings.labels)
                : {}),
        } as GlobalLabels,

        // Cart behavior for JS
        cart: {
            redirectAfterCart: appSettings?.redirectAfterCart || "cart",
            hidePaymentButtons: appSettings?.hidePaymentButtons ?? false,
            disableCartLocale: appSettings?.disableCartLocale ?? false,
        },

        // Custom CSS for Liquid
        custom: {
            cssClass: appSettings?.customCssClass || "",
            css: appSettings?.customCss || "",
        },

        // Currency for JS
        currency: {
            display: appSettings?.currencyDisplay || "symbol",
            format: appSettings?.currencyFormat || "standard",
        },
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

        // Only return valid keys from CustomizerStyles
        const validKeys: (keyof CustomizerStyles)[] = [
            "primaryColor",
            "secondaryColor",
            "textColor",
            "boxMaxWidth",
            "boxAlignment",
            "boxBgColor",
            "boxBorderColor",
            "boxBorderWidth",
            "boxRadius",
            "headingFontSize",
            "headingColor",
            "headingTransform",
            "productFontSize",
            "productBgColor",
            "productTextColor",
            "productBorderColor",
            "productRadius",
            "buttonFontSize",
            "buttonBgColor",
            "buttonTextColor",
            "buttonHoverBgColor",
            "buttonHoverTextColor",
            "buttonRadius",
            "badgeFontSize",
            "badgeBgColor",
            "badgeTextColor",
            "badgeRadius",
            "imageRadius",
            "imageSize",
            "imageFit",
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

        return result;
    } catch {
        return {};
    }
}
