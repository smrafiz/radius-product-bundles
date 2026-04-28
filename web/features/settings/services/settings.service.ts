"use server";

/**
 * Settings Service - Business Logic Layer
 */

import {
    formatValidationErrorsAsString,
    sanitizeCss,
    sanitizeText,
} from "@/shared";
import {
    AppSettingsFormData,
    GetSettingsInput,
    SaveSettingsInput,
} from "@/features/settings";
import {
    deleteSettingsByShopId,
    findSettingsByShopDomain,
    findSettingsWithShop,
    findShopByDomain,
    upsertSettings,
} from "@/features/settings/repositories";
import { hasFeature, resolveShopPlan } from "@/shared/services/plan.service";
import { PriorityType } from "@/features/bundles/constants/prisma-enums";
import { appSettingsSchema } from "@/features/settings/schema/zod-schema.generator";

/**
 * Get app settings for a shop
 */
export async function getSettingsService(
    input: GetSettingsInput,
): Promise<AppSettingsFormData | null> {
    const { shop, locale } = input;

    const result = await findSettingsWithShop(shop);

    if (!result?.appSettings) {
        return null;
    }

    const effectiveLocale = locale ?? result.primaryLocale ?? "en";

    return transformSettingsToFormData(
        result.appSettings,
        effectiveLocale,
        result.primaryLocale ?? undefined,
    );
}

/**
 * Save app settings for a shop
 */
export async function saveSettingsService(
    input: SaveSettingsInput,
): Promise<AppSettingsFormData> {
    const { shop, data, locale } = input;

    // Validate input data with Zod schema
    const validationResult = appSettingsSchema.safeParse(data);

    if (!validationResult.success) {
        const formattedErrors: Record<string, { _errors: string[] }> = {};

        validationResult.error.issues.forEach((issue) => {
            const path = issue.path.join(".");
            if (!formattedErrors[path]) {
                formattedErrors[path] = { _errors: [] };
            }
            formattedErrors[path]._errors.push(issue.message);
        });

        throw new Error(
            `Validation failed: ${formatValidationErrorsAsString(formattedErrors)}`,
        );
    }

    const validatedData = validationResult.data;

    // Single query for shop + settings, parallel with plan resolution
    const [shopResult, plan] = await Promise.all([
        findSettingsWithShop(shop),
        resolveShopPlan(shop),
    ]);

    if (!shopResult) {
        throw new Error(`Shop not found: ${shop}`);
    }

    const { shopId, primaryLocale, appSettings: existingSettings } = shopResult;

    // If locale is provided, merge labels under that locale key
    if (locale && validatedData.labels) {
        const existingLabels = existingSettings?.labels as Record<
            string,
            any
        > | null;

        const allLocaleLabels = isLocaleKeyed(existingLabels)
            ? { ...existingLabels }
            : existingLabels
              ? { [primaryLocale || "en"]: existingLabels }
              : {};

        // Strip empty strings — they should fall back to defaults on the storefront
        const sanitizedLabels = stripEmptyStrings(
            sanitizeLabels(validatedData.labels as Record<string, string>),
        );

        allLocaleLabels[locale] = sanitizedLabels;
        validatedData.labels = allLocaleLabels as any;
    }

    // Strip responsive overrides
    if (!hasFeature(plan, "responsive_overrides") && validatedData.globalStyles) {
        const styles = validatedData.globalStyles as Record<string, any>;
        delete styles.tablet;
        delete styles.mobile;
        if (styles.bundleTypeOverrides) {
            for (const key of Object.keys(styles.bundleTypeOverrides)) {
                const override = styles.bundleTypeOverrides[key];
                if (override) {
                    delete override.tablet;
                    delete override.mobile;
                }
            }
        }
    }

    // Strip advanced cart controls — reset to safe defaults
    if (!hasFeature(plan, "advanced_cart_controls")) {
        validatedData.bundlePriorityType = PriorityType.INDEX_BASED;
        validatedData.hidePaymentButtons = false;
        validatedData.maxBundlesPerOrder = 0;
        validatedData.showSavingsBanner = false;
        validatedData.allowDiscountStacking = false;
    }

    // Strip custom CSS
    if (!hasFeature(plan, "custom_css")) {
        validatedData.customCssClass = "";
        validatedData.customCss = "";
    }

    const dbData = transformFormDataToSettings(validatedData, !!locale);
    const savedSettings = await upsertSettings(shopId, dbData);

    return transformSettingsToFormData(
        savedSettings,
        locale,
        primaryLocale ?? undefined,
    );
}

/**
 * Reset settings to defaults for a shop
 */
export async function resetSettingsService(
    input: GetSettingsInput,
): Promise<AppSettingsFormData> {
    const { shop } = input;

    const shopRecord = await findShopByDomain(shop);

    if (!shopRecord) {
        throw new Error(`Shop not found: ${shop}`);
    }

    await deleteSettingsByShopId(shopRecord.id).catch((err) => {
        console.warn("[Settings] Failed to delete settings on reset:", err);
    });

    // Return null to indicate defaults should be used
    return null as any;
}

/**
 * Check if labels JSON is locale-keyed (has locale codes as top-level keys)
 * vs flat (has label field names as top-level keys like "headingLabel")
 */
function isLocaleKeyed(labels: any): boolean {
    if (!labels || typeof labels !== "object") {
        return false;
    }

    const keys = Object.keys(labels);
    if (keys.length === 0) {
        return false;
    }
    // Flat labels have keys like "headingLabel", "addToCartText"
    // Locale-keyed has keys like "en", "fr", "de" (2-5 char locale codes)
    const firstKey = keys[0];
    return (
        firstKey.length <= 5 &&
        !firstKey.includes("Label") &&
        !firstKey.includes("Text")
    );
}

/**
 * Extract labels for a specific locale from locale-keyed or flat structure.
 * Falls back to base locale (e.g. "fr" from "fr-FR"), then primary locale,
 * then "en", then undefined.
 */
function extractLocaleLabels(
    labels: any,
    locale: string,
    primaryLocale?: string,
): any {
    if (!labels) {
        return undefined;
    }

    if (!isLocaleKeyed(labels)) {
        // Flat structure — return as-is (backward compat)
        return labels;
    }

    const base = locale.split("-")[0];
    return (
        labels[locale] ??
        labels[base] ??
        (primaryLocale ? labels[primaryLocale] : undefined) ??
        labels.en ??
        undefined
    );
}

/**
 * Sanitize label string values
 */
function sanitizeLabels(
    labels: Record<string, string>,
): Record<string, string> {
    return Object.fromEntries(
        Object.entries(labels).map(([k, v]) => [
            k,
            typeof v === "string" ? sanitizeText(v) : v,
        ]),
    );
}

/**
 * Strip empty strings from labels — empty fields fall back to defaults on storefront
 */
function stripEmptyStrings(
    labels: Record<string, string>,
): Record<string, string> {
    return Object.fromEntries(
        Object.entries(labels).filter(
            ([, v]) => typeof v === "string" && v.trim() !== "",
        ),
    );
}

/**
 * Transform database settings to form data
 */
function transformSettingsToFormData(
    settings: any,
    locale?: string,
    primaryLocale?: string,
): AppSettingsFormData {
    return {
        // General - Defaults
        defaultDiscountType: settings.defaultDiscountType,
        defaultDiscountValue: settings.defaultDiscountValue,
        maxBundleProducts: settings.maxBundleProducts,
        maxBundlesPerShop: settings.maxBundlesPerShop,
        bundlePriorityType: settings.bundlePriorityType,

        // General - Cart Behavior
        redirectAfterCart: settings.redirectAfterCart,
        hidePaymentButtons: settings.hidePaymentButtons,
        enableStockValidation: settings.enableStockValidation,
        maxBundlesPerOrder: settings.maxBundlesPerOrder,
        showSavingsBanner: settings.showSavingsBanner,
        allowDiscountStacking: settings.allowDiscountStacking,

        // General - Privacy
        enableAnalytics: settings.enableAnalytics,

        // General - Performance
        lazyLoadImages: settings.lazyLoadImages,

        // Labels — extract for requested locale or return flat for backward compat
        labels: locale
            ? extractLocaleLabels(settings.labels, locale, primaryLocale)
            : settings.labels,

        // Style (JSON field) - flat structure
        globalStyles: settings.globalStyles ?? undefined,

        // Advanced
        customCssClass: settings.customCssClass,
        customCss: settings.customCss,

        // Performance
        cacheTtl: String(settings.cacheTtl ?? 300),
    };
}

/**
 * Transform form data to database settings
 * @param data
 * @param localePreMerged - if true, labels are already locale-keyed (pre-merged in saveSettingsService)
 */
function transformFormDataToSettings(
    data: AppSettingsFormData,
    localePreMerged = false,
): any {
    return {
        // General - Defaults
        defaultDiscountType: data.defaultDiscountType,
        defaultDiscountValue: data.defaultDiscountValue,
        maxBundleProducts: data.maxBundleProducts,
        maxBundlesPerShop: data.maxBundlesPerShop,
        bundlePriorityType: data.bundlePriorityType,

        // General - Cart Behavior
        redirectAfterCart: data.redirectAfterCart,
        hidePaymentButtons: data.hidePaymentButtons,
        enableStockValidation: data.enableStockValidation,
        maxBundlesPerOrder: data.maxBundlesPerOrder,
        showSavingsBanner: data.showSavingsBanner,
        allowDiscountStacking: data.allowDiscountStacking,

        // General - Privacy
        enableAnalytics: data.enableAnalytics,

        // General - Performance
        lazyLoadImages: data.lazyLoadImages,

        // Labels (JSON field) — if locale pre-merged, pass through; otherwise sanitize flat labels.
        // undefined → omit from write (preserve existing); explicit null → clear.
        ...(data.labels !== undefined && {
            labels: data.labels
                ? localePreMerged
                    ? data.labels
                    : sanitizeLabels(data.labels as Record<string, string>)
                : null,
        }),

        // Style (JSON field)
        globalStyles: data.globalStyles ?? null,

        // Advanced — sanitize CSS and class names
        customCssClass: sanitizeText(String(data.customCssClass ?? "")),
        customCss: sanitizeCss(String(data.customCss ?? "")),

        // Performance
        cacheTtl: parseInt(String(data.cacheTtl ?? "300"), 10),
    };
}

/**
 * Transform form data to AppSettings format for metafield sync.
 */
export async function transformFormDataToAppSettings(
    data: AppSettingsFormData,
): Promise<any> {
    return transformFormDataToSettings(data);
}
