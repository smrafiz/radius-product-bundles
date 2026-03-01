"use client";

import { WidgetLayoutProps } from "@/shared";
import {
    getButtonBgColor,
    getButtonRadius,
    getButtonFontSize,
    getHeadingFontSize,
    getFontSize,
    getCardRadius,
    getShadow,
} from "@/features/settings";
import {
    SPACING_VALUES,
} from "@/features/settings/constants/defaults.constants";

export function WidgetMinimalist({
    products,
    styles,
    pricing,
    cartButtonText,
    title,
    subtitle,
    badgeText,
}: WidgetLayoutProps) {
    const triggerProduct = products.find((p) => p.role === "TRIGGER");
    const headingFontSize = getHeadingFontSize(styles.headingSize);
    const bodyFontSize = getFontSize(styles.bodySize);
    const cardRadius = getCardRadius(styles.cornerStyle);
    const buttonRadius = getButtonRadius(styles.cornerStyle);
    const buttonFontSize = getButtonFontSize(styles.buttonSize);
    const isButtonOutline = styles.buttonStyle === "outline";
    const buttonBg = getButtonBgColor(styles);
    const spacingValues = SPACING_VALUES[styles.spacing] ?? SPACING_VALUES.comfortable;
    const primaryColor = styles.primaryColor || "#e0598b";

    if (!products.length) {
        return (
            <div
                style={{
                    minHeight: 200,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: styles.textColor,
                    fontSize: 14,
                }}
            >
                Please choose products to see the bundle preview
            </div>
        );
    }

    return (
        <div
            style={{
                position: "relative",
                background: "#fff",
                borderRadius: cardRadius,
                boxShadow: getShadow("soft"),
                padding: spacingValues.padding,
                overflow: "hidden",
            }}
        >
            {badgeText && pricing?.hasDiscount && (
                <span
                    style={{
                        position: "absolute",
                        top: 0,
                        right: 0,
                        background: primaryColor,
                        color: "#fff",
                        fontSize: 11,
                        fontWeight: 700,
                        letterSpacing: 0.5,
                        textTransform: "uppercase",
                        padding: "6px 16px 6px 20px",
                        borderRadius: `0 ${cardRadius} 0 16px`,
                        lineHeight: "1.2",
                    }}
                >
                    {badgeText}
                </span>
            )}

            <div
                style={{
                    display: "flex",
                    gap: 16,
                    alignItems: "flex-start",
                    marginBottom: 16,
                    paddingTop: 8,
                }}
            >
                {triggerProduct?.image && (
                    <div
                        style={{
                            width: 110,
                            height: 110,
                            flexShrink: 0,
                            borderRadius: 12,
                            overflow: "hidden",
                            background: "#f9fafb",
                        }}
                    >
                        <img
                            src={triggerProduct.image}
                            alt={triggerProduct.title}
                            style={{
                                width: "100%",
                                height: "100%",
                                objectFit: styles.imageFit || "cover",
                            }}
                        />
                    </div>
                )}

                <div style={{ flex: 1, minWidth: 0, paddingTop: 4 }}>
                    {title && (
                        <h3
                            style={{
                                fontSize: headingFontSize,
                                fontWeight: 700,
                                color: styles.textColor,
                                margin: "0 0 4px",
                                lineHeight: "1.3",
                            }}
                        >
                            {title}
                        </h3>
                    )}
                    {subtitle && (
                        <p
                            style={{
                                fontSize: bodyFontSize,
                                color: "#6b7280",
                                margin: "0 0 8px",
                                lineHeight: "1.4",
                            }}
                        >
                            {subtitle}
                        </p>
                    )}
                    {pricing && (
                        <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
                            <span
                                style={{
                                    fontSize: 22,
                                    fontWeight: 700,
                                    color: primaryColor,
                                }}
                            >
                                {pricing.finalPrice}
                            </span>
                            {pricing.hasDiscount && pricing.originalPrice && (
                                <span
                                    style={{
                                        fontSize: 15,
                                        color: "#9ca3af",
                                        textDecoration: "line-through",
                                        fontWeight: 500,
                                    }}
                                >
                                    {pricing.originalPrice}
                                </span>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {cartButtonText && (
                <button
                    style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 8,
                        width: "100%",
                        padding: "14px 24px",
                        border: isButtonOutline ? `2px solid ${buttonBg}` : "none",
                        borderRadius: buttonRadius,
                        background: isButtonOutline ? "transparent" : buttonBg,
                        color: isButtonOutline ? buttonBg : "#fff",
                        fontSize: buttonFontSize,
                        fontWeight: 600,
                        cursor: "pointer",
                    }}
                >
                    <svg
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    >
                        <circle cx="9" cy="21" r="1" />
                        <circle cx="20" cy="21" r="1" />
                        <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
                    </svg>
                    {cartButtonText}
                </button>
            )}
        </div>
    );
}
