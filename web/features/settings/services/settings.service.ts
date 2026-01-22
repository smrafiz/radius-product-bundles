"use server";

/**
 * Settings Service - Business Logic Layer
 */

import { prisma } from "@/shared/repositories/prisma-connect";
import { AppSettingsFormData, GetSettingsInput, SaveSettingsInput, } from "@/features/settings";
import { findSettingsByShopDomain, findShopByDomain, upsertSettings, } from "@/features/settings/repositories";

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

    // Find shop by domain
    const shopRecord = await findShopByDomain(shop);

    if (!shopRecord) {
        throw new Error(`Shop not found: ${shop}`);
    }

    // Transform form data to database model
    const dbData = transformFormDataToSettings(data);

    // Upsert settings
    const savedSettings = await upsertSettings(shopRecord.id, dbData);

    // Return transformed data
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

    // Delete existing settings and let defaults apply
    await prisma.appSettings
        .delete({
            where: { shopId: shopRecord.id },
        })
        .catch(() => {
            // Ignore if settings don't exist
        });

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

        // General - Discount
        discountTitle: settings.discountTitle,
        trackOrdersWithoutDiscount: settings.trackOrdersWithoutDiscount,

        // General - Localization
        currencyDisplay: settings.currencyDisplay,
        disableCartLocale: settings.disableCartLocale,

        // Labels (JSON field)
        labels: settings.labels ?? undefined,

        // Style (JSON field)
        globalStyles: settings.globalStyles ?? undefined,

        // Advanced
        currencyFormat: settings.currencyFormat,
        customCssClass: settings.customCssClass,
        customCss: settings.customCss,
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

        // General - Discount
        discountTitle: data.discountTitle,
        trackOrdersWithoutDiscount: data.trackOrdersWithoutDiscount,

        // General - Localization
        currencyDisplay: data.currencyDisplay,
        disableCartLocale: data.disableCartLocale,

        // Labels (JSON field)
        labels: data.labels ?? null,

        // Style (JSON field)
        globalStyles: data.globalStyles ?? null,

        // Advanced
        currencyFormat: data.currencyFormat ?? "",
        customCssClass: data.customCssClass ?? "",
        customCss: data.customCss ?? "",
    };
}
