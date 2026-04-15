/**
 * AppSettings Types
 */

import { DiscountType } from "@/features/bundles";

/**
 * Labels settings for i18n/translation support
 */
export interface AppSettingsLabels {
    // Widget Text
    headingLabel: string;
    addToCartText: string;
    quantityLabel: string;

    // Button States
    addingText: string;
    addedText: string;
    outOfStockText: string;

    // Price Labels
    regularPriceLabel: string;
    bundlePriceLabel: string;
    youSaveLabel: string;
    savingsBadgeText: string;

    // Shipping Labels
    freeShippingLabel: string;
    freeShippingMethodTitle: string;

    // Cart Limits
    maxBundlesReachedText: string;

    // BOGO / Buy X Get Y Labels
    bogoYouPayLabel: string;
    bogoYouSaveLabel: string;
    bogoTriggerBadgeText: string;
    bogoRewardBadgeText: string;
    bogoBadgeText: string;
    bogoFreeText: string;
    bogoBuyText: string;
    bogoGetText: string;
    bogoTotalLabel: string;
    bogoSaveText: string;

    // Checklist Layout Labels
    checklistProgressText: string;
    checklistHintText: string;
    checklistCompletedText: string;
    checklistLockedLabel: string;
    checklistUnlockedLabel: string;
    checklistPricingLockedText: string;

    // Volume Discount Labels
    volumeSelectQuantityLabel: string;
    volumeYouSaveLabel: string;
    volumeUnitLabel: string;
    volumeUnitsLabel: string;
    volumeTotalCostLabel: string;
    volumeCostPerUnitLabel: string;
    volumeRegularPriceLabel: string;

    // Cart Banner
    bannerSavingText: string;
    bannerCustomPriceText: string;
    bannerFreeShippingQualifyText: string;
    bannerFreeShippingText: string;
}

// ═══════════════════════════════════════════════════════════════════════════
// GLOBAL STYLES TYPES
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Color settings for bundle widget
 */
export interface GlobalStyleColors {
    primary: string;
    secondary: string;
    background: string;
    innerBackground: string;
    border: string;
    heading: string;
    text: string;
    button: string;
    buttonText: string;
    buttonHover: string;
    savings: string;
    savingsText: string;
}

/**
 * Typography settings
 */
export interface GlobalStyleTypography {
    headingSize: "sm" | "md" | "lg" | "xl";
    headingTransform: "none" | "uppercase" | "capitalize";
    textSize: "sm" | "md" | "lg";
}

/**
 * Button style settings
 */
export interface GlobalStyleButton {
    size: "sm" | "md" | "lg";
    borderRadius: number;
}

/**
 * Badge style settings
 */
export interface GlobalStyleBadge {
    size: "sm" | "md" | "lg";
    borderRadius: number;
    fontSize: string;
}

/**
 * Product card style settings
 */
export interface GlobalStyleProduct {
    background: string;
    text: string;
    border: string;
    borderRadius: number;
    fontSize: string;
}

/**
 * Image style settings
 */
export interface GlobalStyleImage {
    size: "sm" | "md" | "lg";
    borderRadius: number;
    fit: "cover" | "contain" | "fill";
}

/**
 * Box/container style settings
 */
export interface GlobalStyleBox {
    background: string;
    border: string;
    borderRadius: number;
}

/**
 * Complete global styles settings
 */
export interface AppSettingsGlobalStyles {
    colors: GlobalStyleColors;
    typography: GlobalStyleTypography;
    button: GlobalStyleButton;
    badge: GlobalStyleBadge;
    product: GlobalStyleProduct;
    image: GlobalStyleImage;
    box: GlobalStyleBox;
}

// ═══════════════════════════════════════════════════════════════════════════
// APP SETTINGS TYPES
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Redirect after cart options
 */
export type RedirectAfterCart = "default" | "cart" | "checkout" | "none";

/**
 * Complete AppSettings type (matches Prisma model)
 */
export interface AppSettings {
    id: string;
    shopId: string;

    // General - Defaults
    defaultDiscountType: DiscountType;
    defaultDiscountValue: number;
    maxBundleProducts: number;
    maxBundlesPerShop: number;

    // General - Cart Behavior
    redirectAfterCart: RedirectAfterCart;
    hidePaymentButtons: boolean;
    enableStockValidation: boolean;
    maxBundlesPerOrder: number;
    showSavingsBanner: boolean;
    allowDiscountStacking: boolean;

    // General - Privacy
    enableAnalytics: boolean;

    // General - Performance
    lazyLoadImages: boolean;

    // Labels (JSON)
    labels: AppSettingsLabels | null;

    // Style (JSON)
    globalStyles: AppSettingsGlobalStyles | null;

    // Advanced
    customCssClass: string;
    customCss: string;

    // Metadata
    createdAt: Date;
    updatedAt: Date;
}
