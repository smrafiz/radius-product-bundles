"use client";

import {
    CustomizerStyles,
    getButtonBgColor,
    getButtonFontSize,
    getButtonRadius,
    getButtonHeight,
} from "@/features/settings";
import { PREVIEW_LABELS } from "@/shared";

export function WidgetAddToCart({
    styles,
    cartButtonText,
}: {
    styles: CustomizerStyles;
    cartButtonText?: string;
}) {
    const radius = getButtonRadius(styles.cornerStyle);
    const fontSize = getButtonFontSize(styles.buttonSize);
    const btnHeight = getButtonHeight(styles.buttonSize);
    const bgColor = getButtonBgColor(styles);

    const textColor = "#ffffff";
    const isOutline = styles.buttonStyle === "outline";
    const isFullWidth = styles.buttonWidth === "full";

    return (
        <div className="radius-bundle__actions">
            <button
                type="button"
                aria-label="Add bundle to cart"
                className="radius-bundle__add-to-cart"
                style={{
                    display: "inline-flex",
                    justifyContent: "center",
                    alignItems: "center",
                    width: isFullWidth ? "100%" : "auto",
                    height: btnHeight,
                    fontSize,
                    fontWeight: 600,
                    borderRadius: radius,
                    cursor: "pointer",
                    transition: "opacity 0.2s ease",
                    backgroundColor: isOutline ? "transparent" : bgColor,
                    color: isOutline ? bgColor : textColor,
                    border: isOutline ? `2px solid ${bgColor}` : "none",
                }}
            >
                {cartButtonText || PREVIEW_LABELS.addToCartText}
            </button>
        </div>
    );
}
