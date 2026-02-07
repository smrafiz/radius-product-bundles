"use server";

/**
 * Settings Service - Business Logic Layer
 */

import {
    deleteSettingsByShopId,
    findSettingsByShopDomain,
    findShopByDomain,
    upsertSettings,
} from "@/features/settings/repositories";
import { formatValidationErrorsAsString } from "@/shared";
import { appSettingsSchema } from "@/features/settings/schema/zod-schema.generator";
import {
    AppSettingsFormData,
    GetSettingsInput,
    SaveSettingsInput,
} from "@/features/settings";

/**
 * Get app settings for a shop
 */
export async function getSettingsService(
    input: GetSettingsInput,
): Promise<AppSettingsFormData | null> {
    const { shop } = input;

    const settings = await findSettingsByShopDomain(shop);

    if (!settings) {
        return null;
    }

    // Transform database model to form data
    return transformSettingsToFormData(settings);
}

/**
 * Save app settings for a shop
 */
export async function saveSettingsService(
    input: SaveSettingsInput,
): Promise<AppSettingsFormData> {
    const { shop, data } = input;

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

    // Find shop by domain
    const shopRecord = await findShopByDomain(shop);

    if (!shopRecord) {
        throw new Error(`Shop not found: ${shop}`);
    }

    const dbData = transformFormDataToSettings(validatedData);
    const savedSettings = await upsertSettings(shopRecord.id, dbData);

    return transformSettingsToFormData(savedSettings);
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

    await deleteSettingsByShopId(shopRecord.id).catch(() => {});

    // Return null to indicate defaults should be used
    return null as any;
}

/**
 * Transform database settings to form data
 */
function transformSettingsToFormData(settings: any): AppSettingsFormData {
    return {
        // General - Defaults
        defaultDiscountType: settings.defaultDiscountType,
        defaultDiscountValue: settings.defaultDiscountValue,
        maxBundleProducts: settings.maxBundleProducts,
        maxBundlesPerShop: settings.maxBundlesPerShop,

        // General - Cart Behavior
        redirectAfterCart: settings.redirectAfterCart,
        hidePaymentButtons: settings.hidePaymentButtons,
        enableStockValidation: settings.enableStockValidation,
        maxBundlesPerOrder: settings.maxBundlesPerOrder,

        // General - Privacy
        enableAnalytics: settings.enableAnalytics,

        // Labels (JSON field)
        labels: settings.labels ?? undefined,

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
 */
function transformFormDataToSettings(data: AppSettingsFormData): any {
    return {
        // General - Defaults
        defaultDiscountType: data.defaultDiscountType,
        defaultDiscountValue: data.defaultDiscountValue,
        maxBundleProducts: data.maxBundleProducts,
        maxBundlesPerShop: data.maxBundlesPerShop,

        // General - Cart Behavior
        redirectAfterCart: data.redirectAfterCart,
        hidePaymentButtons: data.hidePaymentButtons,
        enableStockValidation: data.enableStockValidation,
        maxBundlesPerOrder: data.maxBundlesPerOrder,

        // General - Privacy
        enableAnalytics: data.enableAnalytics,

        // Labels (JSON field)
        labels: data.labels ?? null,

        // Style (JSON field)
        globalStyles: data.globalStyles ?? null,

        // Advanced
        customCssClass: data.customCssClass ?? "",
        customCss: data.customCss ?? "",

        // Performance
        cacheTtl: parseInt(String(data.cacheTtl ?? "300"), 10),
    };
}

/**
 * Transform form data to AppSettings format for metafield sync.
 * This converts AppSettingsFormData to the AppSettings interface.
 */
export async function transformFormDataToAppSettings(
    data: AppSettingsFormData,
): Promise<any> {
    return transformFormDataToSettings(data);
}
