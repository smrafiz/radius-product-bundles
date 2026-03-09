"use client";

import { WidgetLayoutProps, PreviewProduct } from "@/shared";
import {
    getButtonBgColor,
    getButtonRadius,
    getButtonFontSize,
    getHeadingFontSize,
    getFontSize,
    getCardRadius,
    getShadow,
} from "@/features/settings";
import { SPACING_VALUES } from "@/features/settings/constants/defaults.constants";

function getRewardBadge(
    product: PreviewProduct,
    labels?: WidgetLayoutProps["labels"],
): string {
    const freeText = labels?.bogoFreeText || "FREE";
    if (product.price === "$0.00" || product.price === "$0") return freeText;
    if (product.compareAtPrice) {
        const current = parseFloat(product.price.replace(/[^0-9.]/g, ""));
        const original = parseFloat(
            product.compareAtPrice.replace(/[^0-9.]/g, ""),
        );
        if (original > 0 && current === 0) return freeText;
        if (original > 0) {
            const pctOff = Math.round(((original - current) / original) * 100);
            return `${pctOff}% Off`;
        }
    }
    return labels?.bogoRewardBadgeText || "You Get";
}

function MinimalistItem({
    product,
    roleColor,
    roleBadgeText,
    styles,
}: {
    product: PreviewProduct;
    roleColor: string;
    roleBadgeText: string;
    styles: WidgetLayoutProps["styles"];
}) {
    const isReward = product.role === "REWARD";
    const savingsColor = styles.savingsColor || "#16a34a";
    return (
        <div
            style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: 10,
                background: `color-mix(in srgb, ${roleColor} 6%, white)`,
                border: `1px solid color-mix(in srgb, ${roleColor} 12%, transparent)`,
                borderRadius: 10,
                minWidth: 0,
            }}
        >
            {product.image && (
                <div
                    style={{
                        width: 56,
                        height: 56,
                        flexShrink: 0,
                        borderRadius: 8,
                        overflow: "hidden",
                        background: "#f9fafb",
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
            <div
                style={{
                    flex: 1,
                    minWidth: 0,
                    display: "flex",
                    flexDirection: "column",
                    gap: 3,
                }}
            >
                <span
                    style={{
                        fontSize: 10,
                        fontWeight: 700,
                        textTransform: "uppercase",
                        letterSpacing: 0.6,
                        padding: "2px 8px",
                        borderRadius: 20,
                        lineHeight: "14px",
                        alignSelf: "flex-start",
                        color: roleColor,
                        background: `color-mix(in srgb, ${roleColor} 10%, transparent)`,
                    }}
                >
                    {roleBadgeText}
                </span>
                <span
                    style={{
                        fontSize: 13,
                        fontWeight: 600,
                        color: styles.textColor,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                    }}
                >
                    {product.title}
                </span>
                <div
                    style={{
                        display: "flex",
                        alignItems: "baseline",
                        gap: 6,
                        flexWrap: "wrap",
                    }}
                >
                    <span
                        style={{
                            fontSize: 13,
                            fontWeight: 700,
                            color: isReward ? savingsColor : styles.textColor,
                        }}
                    >
                        {product.price}
                    </span>
                    {product.compareAtPrice && (
                        <span
                            style={{
                                fontSize: 11,
                                color: "#9ca3af",
                                textDecoration: "line-through",
                            }}
                        >
                            {product.compareAtPrice}
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
}

export function WidgetMinimalist({
    products,
    styles,
    pricing,
    cartButtonText,
    title,
    subtitle,
    badgeText,
    labels,
}: WidgetLayoutProps) {
    const triggerProduct = products.find((p) => p.role === "TRIGGER");
    const headingFontSize = getHeadingFontSize(styles.headingSize);
    const bodyFontSize = getFontSize(styles.bodySize);
    const cardRadius = getCardRadius(styles.cornerStyle);
    const buttonRadius = getButtonRadius(styles.cornerStyle);
    const buttonFontSize = getButtonFontSize(styles.buttonSize);
    const isButtonOutline = styles.buttonStyle === "outline";
    const buttonBg = getButtonBgColor(styles);
    const spacingValues =
        SPACING_VALUES[styles.spacing] ?? SPACING_VALUES.comfortable;
    const primaryColor = styles.primaryColor || "#e0598b";
    const savingsColor = styles.savingsColor || "#16a34a";
    const triggerBadge = labels?.bogoTriggerBadgeText || "You Buy";

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

    const triggers = products.filter((p) => p.role === "TRIGGER");
    const rewards = products.filter((p) => p.role === "REWARD");
    const sortedProducts = [...triggers, ...rewards];

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
                        <div
                            style={{
                                display: "flex",
                                alignItems: "baseline",
                                gap: 8,
                            }}
                        >
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

            {sortedProducts.length > 0 && (
                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(2, 1fr)",
                        gap: 10,
                        marginBottom: 16,
                    }}
                >
                    {sortedProducts.map((product) => {
                        const isReward = product.role === "REWARD";
                        const roleColor = isReward
                            ? savingsColor
                            : primaryColor;
                        const roleBadgeText = isReward
                            ? getRewardBadge(product, labels)
                            : triggerBadge;

                        return (
                            <MinimalistItem
                                key={product.id}
                                product={product}
                                roleColor={roleColor}
                                roleBadgeText={roleBadgeText}
                                styles={styles}
                            />
                        );
                    })}
                </div>
            )}

            {cartButtonText && (
                <button
                    style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 8,
                        width: "100%",
                        padding: "14px 24px",
                        border: isButtonOutline
                            ? `2px solid ${buttonBg}`
                            : "none",
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
