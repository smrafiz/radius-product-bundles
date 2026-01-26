import { CustomizerStyles, GlobalStylesFormData } from "@/features/settings";

/**
 * Transforms structured GlobalStylesFormData to flat CustomizerStyles.
 */
export function transformToFlat(
    globalStyles: GlobalStylesFormData,
): Partial<CustomizerStyles> {
    const flat: Partial<CustomizerStyles> = {};

    // Colors
    if (globalStyles.colors) {
        flat.primaryColor = globalStyles.colors.primary;
        flat.secondaryColor = globalStyles.colors.secondary;
        flat.textColor = globalStyles.colors.text;
        flat.boxBgColor = globalStyles.colors.background;
        flat.boxBorderColor = globalStyles.colors.border;
        flat.headingColor = globalStyles.colors.heading;
        flat.buttonBgColor = globalStyles.colors.button;
        flat.buttonTextColor = globalStyles.colors.buttonText;
        flat.buttonHoverBgColor = globalStyles.colors.buttonHover;
        flat.badgeBgColor = globalStyles.colors.savings;
        flat.badgeTextColor = globalStyles.colors.savingsText;
        flat.productBgColor = globalStyles.colors.innerBackground;
    }

    // Typography
    if (globalStyles.typography) {
        const sizeMap: Record<string, number> = {
            sm: 16,
            md: 18,
            lg: 20,
            xl: 22,
        };
        flat.headingFontSize =
            sizeMap[globalStyles.typography.headingSize] || 20;
        flat.headingTransform = globalStyles.typography.headingTransform;
        const textSizeMap: Record<string, number> = { sm: 14, md: 16, lg: 18 };
        flat.productFontSize =
            textSizeMap[globalStyles.typography.textSize] || 16;
    }

    // Button
    if (globalStyles.button) {
        flat.buttonRadius = globalStyles.button.borderRadius;
    }

    // Badge
    if (globalStyles.badge) {
        flat.badgeRadius = globalStyles.badge.borderRadius;
        flat.badgeFontSize = parseInt(globalStyles.badge.fontSize) || 14;
    }

    // Product
    if (globalStyles.product) {
        flat.productBgColor = globalStyles.product.background;
        flat.productTextColor = globalStyles.product.text;
        flat.productBorderColor = globalStyles.product.border;
        flat.productRadius = globalStyles.product.borderRadius;
        flat.productFontSize = parseInt(globalStyles.product.fontSize) || 16;
    }

    // Image
    if (globalStyles.image) {
        flat.imageRadius = globalStyles.image.borderRadius;
        flat.imageFit = globalStyles.image.fit;
    }

    // Box
    if (globalStyles.box) {
        flat.boxBgColor = globalStyles.box.background;
        flat.boxBorderColor = globalStyles.box.border;
        flat.boxRadius = globalStyles.box.borderRadius;
    }

    return flat;
}

/**
 * Transforms flat CustomizerStyles to structured GlobalStylesFormData.
 */
export function transformToStructured(
    styles: CustomizerStyles,
): GlobalStylesFormData {
    return {
        colors: {
            primary: styles.primaryColor,
            secondary: styles.secondaryColor,
            background: styles.boxBgColor,
            innerBackground: styles.productBgColor,
            border: styles.boxBorderColor,
            heading: styles.headingColor,
            text: styles.textColor,
            button: styles.buttonBgColor,
            buttonText: styles.buttonTextColor,
            buttonHover: styles.buttonHoverBgColor,
            savings: styles.badgeBgColor,
            savingsText: styles.badgeTextColor,
        },
        typography: {
            headingSize:
                styles.headingFontSize >= 22
                    ? "xl"
                    : styles.headingFontSize >= 20
                      ? "lg"
                      : styles.headingFontSize >= 18
                        ? "md"
                        : "sm",
            headingTransform: styles.headingTransform,
            textSize:
                styles.productFontSize >= 18
                    ? "lg"
                    : styles.productFontSize >= 16
                      ? "md"
                      : "sm",
        },
        button: {
            size: "md",
            borderRadius: styles.buttonRadius,
        },
        badge: {
            size: "md",
            borderRadius: styles.badgeRadius,
            fontSize: `${styles.badgeFontSize}px`,
        },
        product: {
            background: styles.productBgColor,
            text: styles.productTextColor,
            border: styles.productBorderColor,
            borderRadius: styles.productRadius,
            fontSize: `${styles.productFontSize}px`,
        },
        image: {
            size: "md",
            borderRadius: styles.imageRadius,
            fit: styles.imageFit,
        },
        box: {
            background: styles.boxBgColor,
            border: styles.boxBorderColor,
            borderRadius: styles.boxRadius,
        },
    };
}
