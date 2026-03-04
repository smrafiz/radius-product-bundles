"use client";

import { WidgetLayoutProps, PreviewProduct } from "@/shared";
import {
    getButtonBgColor,
    getButtonRadius,
    getButtonFontSize,
    getButtonPadding,
    getHeadingFontSize,
    getFontSize,
    getCardRadius,
} from "@/features/settings";
import { DEFAULT_LABELS } from "@/features/settings/constants/defaults.constants";
import {
    SPACING_VALUES,
} from "@/features/settings/constants/defaults.constants";

function SplitProductCard({
    product,
    isReward,
    styles,
}: {
    product: PreviewProduct;
    isReward: boolean;
    styles: WidgetLayoutProps["styles"];
}) {
    const bodyFontSize = getFontSize(styles.bodySize);
    const cardRadius = getCardRadius(styles.cornerStyle);
    const freeText = DEFAULT_LABELS.bogoFreeText;
    const hasDiscount = isReward && !!product.compareAtPrice;
    const isFreePrice =
        hasDiscount && (product.price === "$0.00" || product.price === "$0");

    const savingsPct =
        hasDiscount && product.compareAtPrice
            ? Math.round(
                  ((parseFloat(product.compareAtPrice.replace(/[^0-9.]/g, "")) -
                      parseFloat(product.price.replace(/[^0-9.]/g, ""))) /
                      parseFloat(
                          product.compareAtPrice.replace(/[^0-9.]/g, ""),
                      )) *
                      100,
              )
            : 0;

    return (
        <div
            style={{
                display: "flex",
                gap: 10,
                alignItems: "center",
            }}
        >
            {product.image && (
                <div
                    style={{
                        width: 56,
                        height: 56,
                        flexShrink: 0,
                        borderRadius: cardRadius,
                        overflow: "hidden",
                        backgroundColor: "#f3f4f6",
                    }}
                >
                    <img
                        src={product.image}
                        alt={product.title}
                        style={{
                            width: "100%",
                            height: "100%",
                            objectFit: styles.imageFit || "cover",
                        }}
                    />
                </div>
            )}
            <div style={{ flex: 1, minWidth: 0 }}>
                <div
                    style={{
                        fontSize: bodyFontSize,
                        fontWeight: 600,
                        color: styles.textColor,
                        lineHeight: "1.3",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                    }}
                >
                    {product.title}
                </div>
                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 5,
                        marginTop: 2,
                    }}
                >
                    <span
                        style={{
                            fontSize: 14,
                            fontWeight: 700,
                            color: hasDiscount
                                ? (styles.bogoFreeTagColor || "#16a34a")
                                : styles.textColor,
                        }}
                    >
                        {isFreePrice ? freeText : product.price}
                    </span>
                    {hasDiscount && (
                        <span
                            style={{
                                fontSize: 12,
                                color: "#9ca3af",
                                textDecoration: "line-through",
                            }}
                        >
                            {product.compareAtPrice}
                        </span>
                    )}
                </div>
                {savingsPct > 0 && (
                    <span
                        style={{
                            display: "inline-flex",
                            alignItems: "center",
                            fontSize: 10,
                            fontWeight: 700,
                            color: styles.savingsColor || "#16a34a",
                            background: "rgba(22, 163, 74, 0.08)",
                            padding: "1px 6px",
                            borderRadius: 4,
                            marginTop: 3,
                        }}
                    >
                        Save {savingsPct}%
                    </span>
                )}
            </div>
        </div>
    );
}

export function WidgetSplitDeal({
    products,
    styles,
    pricing,
    cartButtonText,
    title,
    subtitle,
    badgeText,
    labels,
}: WidgetLayoutProps) {
    const triggerProducts = products.filter((p) => p.role === "TRIGGER");
    const rewardProducts = products.filter((p) => p.role === "REWARD");
    const headingFontSize = getHeadingFontSize(styles.headingSize);
    const spacingValues =
        SPACING_VALUES[styles.spacing] ?? SPACING_VALUES.comfortable;
    const cardRadius = getCardRadius(styles.cornerStyle);
    const showPricingBar = styles.pricingSummaryBox !== false;
    const pricingBarBg = styles.pricingSummaryBg || "#DDEDDF";
    const isButtonOutline = styles.buttonStyle === "outline";
    const buttonBg = getButtonBgColor(styles);
    const isFullWidth = styles.buttonWidth !== "auto";
    const triggerBadge =
        labels?.bogoTriggerBadgeText || DEFAULT_LABELS.bogoTriggerBadgeText;
    const rewardBadge =
        labels?.bogoRewardBadgeText || DEFAULT_LABELS.bogoRewardBadgeText;

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
                display: "flex",
                flexDirection: "column",
                gap: spacingValues.gap,
            }}
        >
            {/* Header */}
            <div style={{ textAlign: "center", marginBottom: spacingValues.gap }}>
                {badgeText && (
                    <div
                        style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 6,
                            background: styles.primaryColor || "#303030",
                            color: "#fff",
                            fontSize: 12,
                            fontWeight: 700,
                            padding: "5px 14px",
                            borderRadius: 20,
                            marginBottom: 10,
                            letterSpacing: "0.02em",
                            textTransform: "uppercase" as const,
                        }}
                    >
                        {badgeText}
                    </div>
                )}
                {title && (
                    <h3
                        style={{
                            fontSize: headingFontSize,
                            fontWeight: 700,
                            color: styles.textColor,
                            margin: 0,
                        }}
                    >
                        {title}
                    </h3>
                )}
                {subtitle && (
                    <p
                        style={{
                            fontSize: 14,
                            color: "#6b7280",
                            margin: "4px 0 0",
                        }}
                    >
                        {subtitle}
                    </p>
                )}
            </div>

            {/* Equation: BUY + GET */}
            <div
                style={{
                    display: "flex",
                    alignItems: "stretch",
                    gap: spacingValues.gap,
                }}
            >
                {/* Trigger Column */}
                <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column" }}>
                    <div
                        style={{
                            fontSize: 11,
                            fontWeight: 700,
                            textTransform: "uppercase" as const,
                            letterSpacing: "0.06em",
                            padding: "6px 12px",
                            borderRadius: `${cardRadius} ${cardRadius} 0 0`,
                            textAlign: "center",
                            background: styles.primaryColor || "#303030",
                            color: "#fff",
                        }}
                    >
                        {triggerBadge}
                    </div>
                    <div
                        style={{
                            flex: 1,
                            border: `2px solid ${styles.primaryColor || "#303030"}`,
                            borderTop: "none",
                            borderRadius: `0 0 ${cardRadius} ${cardRadius}`,
                            padding: spacingValues.padding,
                            background: styles.productCardBg || "#fff",
                            display: "flex",
                            flexDirection: "column",
                            gap: spacingValues.gap,
                        }}
                    >
                        {triggerProducts.map((p) => (
                            <SplitProductCard
                                key={p.id}
                                product={p}
                                isReward={false}
                                styles={styles}
                            />
                        ))}
                    </div>
                </div>

                {/* Connector */}
                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                        width: 36,
                    }}
                >
                    <span
                        style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            width: 28,
                            height: 28,
                            background: styles.primaryColor || "#303030",
                            color: "#fff",
                            borderRadius: "50%",
                            fontSize: 16,
                            fontWeight: 700,
                            lineHeight: 1,
                        }}
                    >
                        +
                    </span>
                </div>

                {/* Reward Column */}
                <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column" }}>
                    <div
                        style={{
                            fontSize: 11,
                            fontWeight: 700,
                            textTransform: "uppercase" as const,
                            letterSpacing: "0.06em",
                            padding: "6px 12px",
                            borderRadius: `${cardRadius} ${cardRadius} 0 0`,
                            textAlign: "center",
                            background: styles.savingsColor || "#16a34a",
                            color: "#fff",
                        }}
                    >
                        {rewardBadge}
                    </div>
                    <div
                        style={{
                            flex: 1,
                            border: `2px solid ${styles.savingsColor || "#16a34a"}`,
                            borderTop: "none",
                            borderRadius: `0 0 ${cardRadius} ${cardRadius}`,
                            padding: spacingValues.padding,
                            background: styles.productCardBg || "#fff",
                            display: "flex",
                            flexDirection: "column",
                            gap: spacingValues.gap,
                        }}
                    >
                        {rewardProducts.map((p) => (
                            <SplitProductCard
                                key={p.id}
                                product={p}
                                isReward={true}
                                styles={styles}
                            />
                        ))}
                    </div>
                </div>
            </div>

            {/* Savings Summary */}
            {pricing?.hasDiscount && showPricingBar && (
                <div
                    style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        backgroundColor: pricingBarBg,
                        borderRadius: cardRadius,
                        padding: `12px ${spacingValues.padding}px`,
                        marginTop: spacingValues.gap,
                    }}
                >
                    <div>
                        <span
                            style={{
                                display: "block",
                                fontSize: 11,
                                fontWeight: 600,
                                textTransform: "uppercase" as const,
                                letterSpacing: "0.04em",
                                marginBottom: 2,
                                color: "#166534",
                            }}
                        >
                            {labels?.bogoYouPayLabel ||
                                DEFAULT_LABELS.bogoYouPayLabel}
                        </span>
                        <span
                            style={{
                                display: "block",
                                fontSize: 18,
                                fontWeight: 700,
                                color: "#111827",
                            }}
                        >
                            {pricing.finalPrice}
                        </span>
                    </div>
                    <div style={{ textAlign: "right" }}>
                        <span
                            style={{
                                display: "block",
                                fontSize: 11,
                                fontWeight: 600,
                                textTransform: "uppercase" as const,
                                letterSpacing: "0.04em",
                                marginBottom: 2,
                                color: "#15803d",
                            }}
                        >
                            {labels?.bogoYouSaveLabel ||
                                DEFAULT_LABELS.bogoYouSaveLabel}
                        </span>
                        <span
                            style={{
                                display: "block",
                                fontSize: 18,
                                fontWeight: 700,
                                color: styles.savingsColor || "#16a34a",
                            }}
                        >
                            {pricing.savingsAmount}
                        </span>
                    </div>
                </div>
            )}

            {/* CTA Button */}
            {cartButtonText && (
                <button
                    style={{
                        width: isFullWidth ? "100%" : "auto",
                        alignSelf: isFullWidth ? undefined : "center",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 8,
                        padding: getButtonPadding(styles.buttonSize),
                        marginTop: spacingValues.gap,
                        backgroundColor: isButtonOutline
                            ? "transparent"
                            : buttonBg,
                        color: isButtonOutline ? buttonBg : "#fff",
                        border: isButtonOutline
                            ? `2px solid ${buttonBg}`
                            : "none",
                        borderRadius: getButtonRadius(styles.cornerStyle),
                        fontSize: getButtonFontSize(styles.buttonSize),
                        fontWeight: 600,
                        cursor: "pointer",
                    }}
                >
                    {cartButtonText}
                    <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                    >
                        <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
                        <line x1="3" y1="6" x2="21" y2="6" />
                        <path d="M16 10a4 4 0 01-8 0" />
                    </svg>
                </button>
            )}
        </div>
    );
}
