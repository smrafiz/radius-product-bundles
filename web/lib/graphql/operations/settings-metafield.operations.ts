import {
    DEFAULT_GLOBAL_LABELS,
    DEFAULT_GLOBAL_STYLES,
    GlobalLabels,
    GlobalStyleSettings,
    ResponsiveSettings,
    StyleOverrides,
    WidgetBehavior,
} from "@/features/settings";
import { AppSettings } from "@/prisma/generated/client";
import { BundleWithSettings } from "@/features/bundles";
import { findActiveBundlesByShop } from "@/features/bundles/repositories";

interface MetafieldGlobalSettings {
    styles: GlobalStyleSettings;
    labels: GlobalLabels;
    defaults: {
        layout: string;
        discountType: string;
        discountValue: number;
    };
    features: {
        aiOptimizations: boolean;
        aiRecommendations: boolean;
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
        const maybeParsed =
            typeof labels === "string"
                ? (JSON.parse(labels) as unknown)
                : labels;

        if (!isRecord(maybeParsed)) {
            return {};
        }

        const result: Partial<GlobalLabels> = {};

        for (const key of Object.keys(DEFAULT_GLOBAL_LABELS) as Array<
            keyof GlobalLabels
        >) {
            const value = maybeParsed[key as string];
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
        styles: appSettings?.globalStyles
            ? mergeDeep(
                  DEFAULT_GLOBAL_STYLES,
                  getValidGlobalStyles(appSettings.globalStyles),
              )
            : DEFAULT_GLOBAL_STYLES,
        labels: appSettings?.labels
            ? mergeDeep(
                  DEFAULT_GLOBAL_LABELS,
                  getValidGlobalLabels(appSettings.labels),
              )
            : DEFAULT_GLOBAL_LABELS,
        defaults: {
            layout: "LIST",
            discountType: appSettings?.defaultDiscountType || "PERCENTAGE",
            discountValue: appSettings?.defaultDiscountValue || 10,
        },
        features: {
            aiOptimizations: appSettings?.aiOptimizations ?? true,
            aiRecommendations: appSettings?.aiRecommendations ?? true,
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
