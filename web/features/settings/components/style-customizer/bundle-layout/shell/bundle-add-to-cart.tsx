"use client";

import {
    getButtonBgColor,
    getButtonFontSize,
    getButtonPadding,
    getButtonRadius,
    useCustomizerStore,
} from "@/features/settings";
import { DEFAULT_LABELS } from "@/features/settings/constants/defaults.constants";

/**
 * Bundle add to cart button.
 */
export function BundleAddToCart() {
    const { styles } = useCustomizerStore();

    const radius = getButtonRadius(styles.cornerStyle);
    const fontSize = getButtonFontSize(styles.buttonSize);
    const padding = getButtonPadding(styles.buttonSize);
    const bgColor = getButtonBgColor(styles);

    const textColor = "#ffffff";
    const isOutline = styles.buttonStyle === "outline";
    const isFullWidth = styles.buttonWidth === "full";

    return (
        <div className="radius-bundle__actions">
            <button
                className="radius-bundle__add-to-cart"
                style={{
                    display: "inline-flex",
                    justifyContent: "center",
                    alignItems: "center",
                    width: isFullWidth ? "100%" : "auto",
                    padding,
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
                {DEFAULT_LABELS.addToCartText}
            </button>
        </div>
    );
}
