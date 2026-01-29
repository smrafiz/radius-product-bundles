import { z } from "zod";

/**
 * Hex color validation (allows empty for inheritance).
 */
const hexColor = z
    .string()
    .regex(/^(#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})|)$/, "Invalid hex color");

/**
 * Required hex color validation.
 */
const requiredHexColor = z
    .string()
    .regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, "Invalid hex color");

/**
 * Global styles schema - styling focused.
 */
export const globalStylesSchema = z.object({
    // ═══════════════════════════════════════════════════════════════════
    // APPEARANCE - COLORS
    // ═══════════════════════════════════════════════════════════════════
    primaryColor: requiredHexColor.optional(),
    textColor: requiredHexColor.optional(),
    backgroundColor: requiredHexColor.optional(),
    borderColor: requiredHexColor.optional(),
    savingsColor: requiredHexColor.optional(),

    // ═══════════════════════════════════════════════════════════════════
    // APPEARANCE - SHAPE & DEPTH
    // ═══════════════════════════════════════════════════════════════════
    cornerStyle: z.enum(["sharp", "modern", "rounded"]).optional(),
    shadow: z.enum(["none", "soft", "strong"]).optional(),
    spacing: z.enum(["compact", "comfortable", "spacious"]).optional(),

    // ═══════════════════════════════════════════════════════════════════
    // PRODUCT CARDS
    // ═══════════════════════════════════════════════════════════════════
    customizeCardStyle: z.boolean().optional(),
    productCardBg: hexColor.optional(),
    productCardBorder: z.boolean().optional(),
    productCardShadow: z.boolean().optional(),
    imageSize: z.enum(["small", "medium", "large"]).optional(),
    imageFit: z.enum(["cover", "contain"]).optional(),
    imagePosition: z.enum(["left", "top"]).optional(),

    // ═══════════════════════════════════════════════════════════════════
    // BUTTON
    // ═══════════════════════════════════════════════════════════════════
    buttonStyle: z.enum(["filled", "outline"]).optional(),
    buttonSize: z.enum(["small", "medium", "large"]).optional(),
    buttonWidth: z.enum(["auto", "full"]).optional(),
    buttonBgColor: hexColor.optional(),

    // ═══════════════════════════════════════════════════════════════════
    // BADGE
    // ═══════════════════════════════════════════════════════════════════
    badgePosition: z.enum(["top-left", "top-right", "inline"]).optional(),
    badgeStyle: z.enum(["filled", "outline"]).optional(),

    // ═══════════════════════════════════════════════════════════════════
    // ADVANCED - CONTAINER
    // ═══════════════════════════════════════════════════════════════════
    boxMaxWidth: z.number().min(300).max(1200).optional(),
    boxAlignment: z.enum(["left", "center", "right"]).optional(),
    showBorder: z.boolean().optional(),

    // ═══════════════════════════════════════════════════════════════════
    // ADVANCED - TYPOGRAPHY
    // ═══════════════════════════════════════════════════════════════════
    headingSize: z.enum(["small", "medium", "large"]).optional(),
    bodySize: z.enum(["small", "medium", "large"]).optional(),

    // ═══════════════════════════════════════════════════════════════════
    // ADVANCED - LIST LAYOUT
    // ═══════════════════════════════════════════════════════════════════
    dividerStyle: z.enum(["none", "line", "plus"]).optional(),

    // ═══════════════════════════════════════════════════════════════════
    // ADVANCED - GRID LAYOUT
    // ═══════════════════════════════════════════════════════════════════
    gridColumns: z.union([z.literal(2), z.literal(3), z.literal(4)]).optional(),

    // ═══════════════════════════════════════════════════════════════════
    // ADVANCED - CAROUSEL LAYOUT
    // ═══════════════════════════════════════════════════════════════════
    slidesPerView: z
        .union([z.literal(2), z.literal(3), z.literal(4)])
        .optional(),
    carouselNavigation: z.enum(["none", "arrows", "dots", "both"]).optional(),
    autoplay: z.boolean().optional(),
    autoplaySpeed: z.number().min(1).max(15).optional(),

    // ═══════════════════════════════════════════════════════════════════
    // ADVANCED - BOGO SPECIFIC
    // ═══════════════════════════════════════════════════════════════════
    bogoFreeTagColor: requiredHexColor.optional(),

    // ═══════════════════════════════════════════════════════════════════
    // ADVANCED - BUY X GET Y SPECIFIC
    // ═══════════════════════════════════════════════════════════════════
    buyGetTierStyle: z.enum(["cards", "list", "tabs"]).optional(),
});

/**
 * Inferred type from schema.
 */
export type GlobalStylesFormData = z.infer<typeof globalStylesSchema>;
