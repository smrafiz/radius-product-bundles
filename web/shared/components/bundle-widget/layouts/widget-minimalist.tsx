"use client";

import { WidgetLayoutProps, PreviewProduct } from "@/shared";
import {
    getButtonBgColor,
    getButtonRadius,
    getButtonFontSize,
    getHeadingFontSize,
    getFontSize,
    getCardRadius,
    getButtonPadding,
    getImageSize,
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
    displayOptions,
    styles,
}: {
    product: PreviewProduct;
    roleColor: string;
    roleBadgeText: string;
    displayOptions: WidgetLayoutProps["displayOptions"];
    styles: WidgetLayoutProps["styles"];
}) {
    const isReward = product.role === "REWARD";
    const savingsColor = styles.savingsColor || "#16a34a";
    const cardRadius = getCardRadius(styles.cornerStyle);
    const bodyFontSize = getFontSize(styles.bodySize);
    const imageSizePx = getImageSize(styles.imageSize);

    return (
        <div
            style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "15px 10px",
                background: `color-mix(in srgb, ${roleColor} 6%, ${styles.backgroundColor || "white"})`,
                border: `1px solid color-mix(in srgb, ${roleColor} 12%, transparent)`,
                borderRadius: cardRadius,
                minWidth: 0,
                position: "relative",
            }}
        >
            {product.image && displayOptions.showImages && (
                <div
                    style={{
                        width: `calc(${imageSizePx} - 20px)`,
                        height: `calc(${imageSizePx} - 20px)`,
                        flexShrink: 0,
                        borderRadius: cardRadius,
                        overflow: "hidden",
                        background: styles.productCardBg || "#f9fafb",
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
                    gap: 6,
                }}
            >
                {displayOptions.showSavingsBadge && (
                <span
                    style={{
                        fontSize: parseInt(bodyFontSize) - 5,
                        fontWeight: 500,
                        textTransform: "uppercase",
                        letterSpacing: 0.6,
                        padding: "2px 8px",
                        borderRadius: `0 ${cardRadius} 0 16px`,
                        lineHeight: "14px",
                        alignSelf: "flex-start",
                        color: roleColor,
                        background: `color-mix(in srgb, ${roleColor} 10%, transparent)`,
                        position: "absolute",
                        top: 0,
                        right: 0,
                    }}
                >
                    {roleBadgeText}
                </span>
                    )}
                <span
                    style={{
                        fontSize: bodyFontSize,
                        fontWeight: 500,
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
                    {displayOptions.showPrices && (
                    <span
                        style={{
                            fontSize: parseInt(bodyFontSize),
                            fontWeight: 500,
                            color: isReward ? savingsColor : styles.textColor,
                        }}
                    >
                        {product.price}
                    </span>
                    )}
                    {product.compareAtPrice && displayOptions.showComparePrices && (
                        <span
                            style={{
                                fontSize: parseInt(bodyFontSize) - 3,
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
    displayOptions,
    pricing,
    cartButtonText,
    title,
    subtitle,
    badgeText,
    labels,
    activeDevice,
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
    const isFullWidth = styles.buttonWidth === "full";
    const accentColor = styles.primaryColor || "#303030";
    const isOutline = styles.badgeStyle === "outline";

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
                padding: spacingValues.padding,
            }}
        >
            {badgeText && pricing?.hasDiscount && displayOptions.showSavingsBadge && (
                <span
                    style={{
                        position: "absolute",
                        top: 0,
                        right: 0,
                        backgroundColor: isOutline
                            ? "transparent"
                            : accentColor,
                        color: isOutline ? styles.primaryColor : "#ffffff",
                        border: isOutline ? `2px solid ${accentColor}` : "none",
                        fontSize: parseInt(bodyFontSize) - 5,
                        fontWeight: 600,
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
                {triggerProduct?.image && displayOptions.showImages && (
                    <div
                        style={{
                            width: 110,
                            height: 110,
                            flexShrink: 0,
                            borderRadius: cardRadius,
                            border: `1px solid ${styles.borderColor}`,
                            overflow: "hidden",
                            background: styles.productCardBg || "#f9fafb",
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
                                fontWeight: 600,
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
                                color: styles.textColor,
                                margin: "0 0 8px",
                                lineHeight: "1.3",
                                opacity: 0.8,
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
                                    fontSize: headingFontSize,
                                    fontWeight: 600,
                                    color: primaryColor,
                                }}
                            >
                                {pricing.finalPrice}
                            </span>
                            {pricing.hasDiscount && pricing.originalPrice && (
                                <span
                                    style={{
                                        fontSize: parseInt(bodyFontSize) - 2,
                                        color: styles.textColor,
                                        textDecoration: "line-through",
                                        fontWeight: 500,
                                        opacity: 0.5,
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
                        gridTemplateColumns:
                            activeDevice === "mobile"
                                ? "repeat(1, 1fr)"
                                : "repeat(2, 1fr)",
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
                                displayOptions={displayOptions}
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
                        width: isFullWidth ? "100%" : "auto",
                        padding: getButtonPadding(styles.buttonSize),
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
