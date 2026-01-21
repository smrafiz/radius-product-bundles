import { z } from "zod";
import { sanitizeHtml } from "@/shared";

// ═══════════════════════════════════════════════════════════════════════════
// GENERAL TAB SCHEMA
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Schema for the Defaults section
 */
const defaultsSchema = z.object({
    defaultDiscountType: z.enum([
        "PERCENTAGE",
        "FIXED_AMOUNT",
        "CUSTOM_PRICE",
        "NO_DISCOUNT",
    ]),
    defaultDiscountValue: z
        .number()
        .min(0, "Discount value must be at least 0")
        .max(100, "Discount value cannot exceed 100"),
    maxBundleProducts: z
        .number()
        .int()
        .min(2, "Minimum 2 products per bundle")
        .max(20, "Maximum 20 products per bundle"),
    maxBundlesPerShop: z.number().int().min(1).max(5),
});

/**
 * Schema for the Cart Behavior section
 */
const cartBehaviorSchema = z.object({
    redirectAfterCart: z.enum(["cart", "checkout", "none", "drawer"]),
    hidePaymentButtons: z.boolean(),
    enableStockValidation: z.boolean(),
});

/**
 * Schema for the Discount section
 */
const discountSchema = z.object({
    discountTitle: z
        .string()
        .min(1, "Discount title is required")
        .max(60, "Discount title cannot exceed 60 characters")
        .transform(sanitizeHtml),
    trackOrdersWithoutDiscount: z.boolean(),
});

/**
 * Schema for the Localization section
 */
const localizationSchema = z.object({
    currencyDisplay: z.enum(["store", "code", "symbol"]),
    disableCartLocale: z.boolean(),
});

/**
 * Complete General tab schema
 */
export const generalSettingsSchema = z.object({
    ...defaultsSchema.shape,
    ...cartBehaviorSchema.shape,
    ...discountSchema.shape,
    ...localizationSchema.shape,
});

// ═══════════════════════════════════════════════════════════════════════════
// LABELS TAB SCHEMA
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Schema for all label fields
 */
export const labelsSettingsSchema = z.object({
    // Widget Text
    headingLabel: z
        .string()
        .max(100, "Heading cannot exceed 100 characters")
        .transform(sanitizeHtml),
    addToCartText: z
        .string()
        .max(50, "Button text cannot exceed 50 characters")
        .transform(sanitizeHtml),
    quantityLabel: z
        .string()
        .max(20, "Quantity label cannot exceed 20 characters")
        .transform(sanitizeHtml),

    // Button States
    addingText: z
        .string()
        .max(30, "Adding text cannot exceed 30 characters")
        .transform(sanitizeHtml),
    addedText: z
        .string()
        .max(30, "Added text cannot exceed 30 characters")
        .transform(sanitizeHtml),
    outOfStockText: z
        .string()
        .max(30, "Out of stock text cannot exceed 30 characters")
        .transform(sanitizeHtml),

    // Price Labels
    regularPriceLabel: z
        .string()
        .max(30, "Regular price label cannot exceed 30 characters")
        .transform(sanitizeHtml),
    bundlePriceLabel: z
        .string()
        .max(30, "Bundle price label cannot exceed 30 characters")
        .transform(sanitizeHtml),
    youSaveLabel: z
        .string()
        .max(30, "Savings label cannot exceed 30 characters")
        .transform(sanitizeHtml),
    savingsBadgeText: z
        .string()
        .max(30, "Savings badge text cannot exceed 30 characters")
        .transform(sanitizeHtml),

    // Shipping Labels
    freeShippingLabel: z
        .string()
        .max(30, "Free shipping label cannot exceed 30 characters")
        .transform(sanitizeHtml),
    freeShippingMethodTitle: z
        .string()
        .max(50, "Shipping method title cannot exceed 50 characters")
        .transform(sanitizeHtml),
});

// ═══════════════════════════════════════════════════════════════════════════
// STYLE TAB SCHEMA
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Hex color validation regex
 */
const hexColorRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;

/**
 * Schema for color settings
 */
const colorsSchema = z.object({
    primary: z.string().regex(hexColorRegex, "Invalid hex color"),
    secondary: z.string().regex(hexColorRegex, "Invalid hex color"),
    background: z.string().regex(hexColorRegex, "Invalid hex color"),
    innerBackground: z.string().regex(hexColorRegex, "Invalid hex color"),
    border: z.string().regex(hexColorRegex, "Invalid hex color"),
    heading: z.string().regex(hexColorRegex, "Invalid hex color"),
    text: z.string().regex(hexColorRegex, "Invalid hex color"),
    button: z.string().regex(hexColorRegex, "Invalid hex color"),
    buttonText: z.string().regex(hexColorRegex, "Invalid hex color"),
    buttonHover: z.string().regex(hexColorRegex, "Invalid hex color"),
    savings: z.string().regex(hexColorRegex, "Invalid hex color"),
    savingsText: z.string().regex(hexColorRegex, "Invalid hex color"),
});

/**
 * Schema for typography settings
 */
const typographySchema = z.object({
    headingSize: z.enum(["sm", "md", "lg", "xl"]),
    headingTransform: z.enum(["none", "uppercase", "capitalize"]),
    textSize: z.enum(["sm", "md", "lg"]),
});

/**
 * Schema for button settings
 */
const buttonSchema = z.object({
    size: z.enum(["sm", "md", "lg"]),
    borderRadius: z.number().min(0).max(50),
});

/**
 * Schema for badge settings
 */
const badgeSchema = z.object({
    size: z.enum(["sm", "md", "lg"]),
    borderRadius: z.number().min(0).max(50),
    fontSize: z.string(),
});

/**
 * Schema for product card settings
 */
const productSchema = z.object({
    background: z.string().regex(hexColorRegex, "Invalid hex color"),
    text: z.string().regex(hexColorRegex, "Invalid hex color"),
    border: z.string().regex(hexColorRegex, "Invalid hex color"),
    borderRadius: z.number().min(0).max(50),
    fontSize: z.string(),
});

/**
 * Schema for image settings
 */
const imageSchema = z.object({
    size: z.enum(["sm", "md", "lg"]),
    borderRadius: z.number().min(0).max(50),
    fit: z.enum(["cover", "contain", "fill"]),
});

/**
 * Schema for box/container settings
 */
const boxSchema = z.object({
    background: z.string().regex(hexColorRegex, "Invalid hex color"),
    border: z.string().regex(hexColorRegex, "Invalid hex color"),
    borderRadius: z.number().min(0).max(50),
});

/**
 * Complete global styles schema
 */
export const globalStylesSchema = z.object({
    colors: colorsSchema,
    typography: typographySchema,
    button: buttonSchema,
    badge: badgeSchema,
    product: productSchema,
    image: imageSchema,
    box: boxSchema,
});

// ═══════════════════════════════════════════════════════════════════════════
// ADVANCED TAB SCHEMA
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Schema for advanced settings
 */
export const advancedSettingsSchema = z.object({
    currencyFormat: z
        .string()
        .max(50, "Currency format cannot exceed 50 characters"),
    customCssClass: z
        .string()
        .max(100, "Custom CSS class cannot exceed 100 characters")
        .regex(/^[a-zA-Z_-][a-zA-Z0-9_-]*$/, "Invalid CSS class name format")
        .or(z.literal("")),
    customCss: z
        .string()
        .max(10000, "Custom CSS cannot exceed 10,000 characters"),
});

// ═══════════════════════════════════════════════════════════════════════════
// COMPLETE SETTINGS SCHEMA
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Complete app settings schema combining all tabs
 */
export const appSettingsSchema = z.object({
    // General tab
    ...generalSettingsSchema.shape,

    // Labels tab (as JSON)
    labels: labelsSettingsSchema.optional(),

    // Style tab (as JSON)
    globalStyles: globalStylesSchema.optional(),

    // Advanced tab
    ...advancedSettingsSchema.shape,
});

// ═══════════════════════════════════════════════════════════════════════════
// TYPE EXPORTS
// ═══════════════════════════════════════════════════════════════════════════

export type GeneralSettingsFormData = z.infer<typeof generalSettingsSchema>;
export type LabelsSettingsFormData = z.infer<typeof labelsSettingsSchema>;
export type GlobalStylesFormData = z.infer<typeof globalStylesSchema>;
export type AdvancedSettingsFormData = z.infer<typeof advancedSettingsSchema>;
export type AppSettingsFormData = z.infer<typeof appSettingsSchema>;
