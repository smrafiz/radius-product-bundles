import {
    CornerStyle,
    SizePreset,
    SpacingPreset,
    ShadowStyle,
    CustomizerStyles,
} from "@/features/settings";
import {
    CORNER_STYLE_VALUES,
    SPACING_VALUES,
    IMAGE_SIZE_VALUES,
    TEXT_SIZE_VALUES,
    BUTTON_SIZE_VALUES,
    SHADOW_VALUES,
} from "@/features/settings/constants/defaults.constants";

// ═══════════════════════════════════════════════════════════════════
// CORNER RADIUS HELPERS
// ═══════════════════════════════════════════════════════════════════

/**
 * Gets border radius value for cards based on corner style preset.
 */
export function getCardRadius(cornerStyle: CornerStyle): string {
    const px = CORNER_STYLE_VALUES[cornerStyle] ?? CORNER_STYLE_VALUES.modern;
    return `${px}px`;
}

/**
 * Gets border radius value for badges.
 */
export function getBadgeRadius(cornerStyle: CornerStyle): string {
    const px = CORNER_STYLE_VALUES[cornerStyle] ?? CORNER_STYLE_VALUES.modern;
    return `${Math.max(px, 4)}px`;
}

/**
 * Gets border radius value for buttons.
 */
export function getButtonRadius(cornerStyle: CornerStyle): string {
    const px = CORNER_STYLE_VALUES[cornerStyle] ?? CORNER_STYLE_VALUES.modern;
    return `${px}px`;
}

// ═══════════════════════════════════════════════════════════════════
// SPACING HELPERS
// ═══════════════════════════════════════════════════════════════════

/**
 * Gets gap spacing value based on spacing preset.
 */
export function getSpacing(spacing: SpacingPreset): string {
    const values = SPACING_VALUES[spacing] ?? SPACING_VALUES.comfortable;
    return `${values.gap}px`;
}

// ═══════════════════════════════════════════════════════════════════
// IMAGE SIZE HELPERS
// ═══════════════════════════════════════════════════════════════════

/**
 * Gets image size in pixels based on size preset.
 */
export function getImageSize(size: SizePreset): string {
    const px = IMAGE_SIZE_VALUES[size] ?? IMAGE_SIZE_VALUES.medium;
    return `${px}px`;
}

// ═══════════════════════════════════════════════════════════════════
// FONT SIZE HELPERS
// ═══════════════════════════════════════════════════════════════════

/**
 * Gets body font size based on size preset.
 */
export function getFontSize(size: SizePreset): string {
    const values = TEXT_SIZE_VALUES[size] ?? TEXT_SIZE_VALUES.medium;
    return `${values.body}px`;
}

/**
 * Gets heading font size based on size preset.
 */
export function getHeadingFontSize(size: SizePreset): string {
    const values = TEXT_SIZE_VALUES[size] ?? TEXT_SIZE_VALUES.medium;
    return `${values.heading}px`;
}

// ═══════════════════════════════════════════════════════════════════
// BUTTON HELPERS
// ═══════════════════════════════════════════════════════════════════

/**
 * Gets button font size based on size preset.
 */
export function getButtonFontSize(size: SizePreset): string {
    const values = BUTTON_SIZE_VALUES[size] ?? BUTTON_SIZE_VALUES.medium;
    return `${values.fontSize}px`;
}

/**
 * Gets button padding based on size preset.
 */
export function getButtonPadding(size: SizePreset): string {
    const values = BUTTON_SIZE_VALUES[size] ?? BUTTON_SIZE_VALUES.medium;
    return values.padding;
}

// ═══════════════════════════════════════════════════════════════════
// SHADOW HELPERS
// ═══════════════════════════════════════════════════════════════════

/**
 * Gets box shadow CSS value based on shadow preset.
 */
export function getShadow(shadow: ShadowStyle): string {
    return SHADOW_VALUES[shadow] ?? SHADOW_VALUES.none;
}

// ═══════════════════════════════════════════════════════════════════
// COLOR HELPERS
// ═══════════════════════════════════════════════════════════════════

/**
 * Gets effective button background color (with inheritance).
 */
export function getButtonBgColor(
    styles: Pick<CustomizerStyles, "buttonBgColor" | "primaryColor">,
): string {
    return styles.buttonBgColor && styles.buttonBgColor !== ""
        ? styles.buttonBgColor
        : styles.primaryColor || "#303030";
}

/**
 * Gets effective card background color (with inheritance).
 */
export function getCardBgColor(
    styles: Pick<
        CustomizerStyles,
        "customizeCardStyle" | "productCardBg" | "backgroundColor"
    >,
): string {
    return styles.customizeCardStyle
        ? styles.productCardBg || "#f9fafb"
        : styles.backgroundColor || "#ffffff";
}
