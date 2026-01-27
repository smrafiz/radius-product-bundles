import { z } from "zod";

// ═══════════════════════════════════════════════════════════════════════════
// GLOBAL STYLES SCHEMA (Flat Structure)
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Hex color validation regex.
 */
const hexColorRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;

/**
 * Reusable hex color schema.
 */
const hexColor = z.string().regex(hexColorRegex, "Invalid hex color");

/**
 * Global styles schema - flat structure.
 */
export const globalStylesSchema = z.object({
    // ─────────────────────────────────────────────────────────────────────
    // GENERAL COLORS
    // ─────────────────────────────────────────────────────────────────────
    primaryColor: hexColor,
    secondaryColor: hexColor,
    textColor: hexColor,

    // ─────────────────────────────────────────────────────────────────────
    // BOX / CONTAINER
    // ─────────────────────────────────────────────────────────────────────
    boxMaxWidth: z.number().min(0).max(2000),
    boxAlignment: z.enum(["left", "center", "right"]),
    boxBgColor: hexColor,
    boxBorderColor: hexColor,
    boxBorderWidth: z.number().min(0).max(10),
    boxRadius: z.number().min(0).max(50),

    // ─────────────────────────────────────────────────────────────────────
    // HEADING
    // ─────────────────────────────────────────────────────────────────────
    headingFontSize: z.number().min(12).max(48),
    headingColor: hexColor,
    headingTransform: z.enum(["none", "uppercase", "capitalize"]),

    // ─────────────────────────────────────────────────────────────────────
    // PRODUCT CARD
    // ─────────────────────────────────────────────────────────────────────
    productFontSize: z.number().min(10).max(24),
    productBgColor: hexColor,
    productTextColor: hexColor,
    productBorderColor: hexColor,
    productRadius: z.number().min(0).max(50),

    // ─────────────────────────────────────────────────────────────────────
    // BUTTON (Add to Cart)
    // ─────────────────────────────────────────────────────────────────────
    buttonFontSize: z.number().min(10).max(24),
    buttonBgColor: hexColor,
    buttonTextColor: hexColor,
    buttonHoverBgColor: hexColor,
    buttonHoverTextColor: hexColor,
    buttonRadius: z.number().min(0).max(50),

    // ─────────────────────────────────────────────────────────────────────
    // BADGE (Savings/Discount)
    // ─────────────────────────────────────────────────────────────────────
    badgeFontSize: z.number().min(8).max(20),
    badgeBgColor: hexColor,
    badgeTextColor: hexColor,
    badgeRadius: z.number().min(0).max(50),

    // ─────────────────────────────────────────────────────────────────────
    // IMAGE
    // ─────────────────────────────────────────────────────────────────────
    imageRadius: z.number().min(0).max(100),
    imageSize: z.number().min(40).max(300),
    imageFit: z.enum(["cover", "contain", "fill"]),
});

/**
 * Inferred type from the schema.
 */
export type GlobalStylesFormData = z.infer<typeof globalStylesSchema>;
