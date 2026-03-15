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
    getBadgeRadius,
    getShadow,
    getCardBgColor,
} from "@/features/settings";
import { DEFAULT_LABELS } from "@/features/settings/constants/defaults.constants";
import { SPACING_VALUES } from "@/features/settings/constants/defaults.constants";

const IMAGE_ASPECT_RATIOS = {
    small: "4/3",
    medium: "1/1",
    large: "3/4",
} as const;

function ClassicProductItem({
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
    const isHorizontal = styles.imagePosition === "left";
    const freeText = DEFAULT_LABELS.bogoFreeText;
    const hasDiscount = isReward && !!product.compareAtPrice;
    const isFreePrice =
        hasDiscount && (product.price === "$0.00" || product.price === "$0");

    const imageBlock = product.image && (
        <div
            style={{
                width: isHorizontal ? "35%" : "100%",
                flexShrink: isHorizontal ? 0 : undefined,
                aspectRatio: IMAGE_ASPECT_RATIOS[styles.imageSize] ?? "1/1",
                borderRadius: cardRadius,
                overflow: "hidden",
                backgroundColor: styles.productCardBg || "#f9fafb",
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
    );

    const textBlock = (
        <div style={{ flex: 1, minWidth: 0 }}>
            <div
                style={{
                    fontSize: bodyFontSize,
                    fontWeight: 500,
                    color: styles.textColor,
                    marginBottom: 4,
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
                    gap: 6,
                    marginTop: 6,
                }}
            >
                {hasDiscount && (
                    <span
                        style={{
                            fontSize: parseInt(bodyFontSize) - 2,
                            color: "#9ca3af",
                            textDecoration: "line-through",
                        }}
                    >
                        {product.compareAtPrice}
                    </span>
                )}
                <span
                    style={{
                        fontSize: bodyFontSize,
                        fontWeight: 500,
                        color: hasDiscount
                            ? styles.bogoFreeTagColor || "#16a34a"
                            : styles.textColor,
                    }}
                >
                    {isFreePrice ? freeText : product.price}
                </span>
            </div>
        </div>
    );

    return (
        <div
            style={{
                display: isHorizontal ? "flex" : undefined,
                gap: isHorizontal ? 12 : undefined,
                alignItems: isHorizontal ? "center" : undefined,
            }}
        >
            {isHorizontal ? (
                <>
                    {imageBlock}
                    {textBlock}
                </>
            ) : (
                <>
                    <div style={{ marginTop: 8, marginBottom: 10 }}>
                        {imageBlock}
                    </div>
                    {textBlock}
                </>
            )}
        </div>
    );
}

export function WidgetClassicCard({
    products,
    styles,
    pricing,
    cartButtonText,
    title,
    subtitle,
    badgeText,
    labels,
    activeDevice,
}: WidgetLayoutProps) {
    const triggerProducts = products.filter((p) => p.role === "TRIGGER");
    const rewardProducts = products.filter((p) => p.role === "REWARD");
    const headingFontSize = getHeadingFontSize(styles.headingSize);
    const spacingValues =
        SPACING_VALUES[styles.spacing] ?? SPACING_VALUES.comfortable;
    const cardRadius = getCardRadius(styles.cornerStyle);
    const badgeRadius = getBadgeRadius(styles.cornerStyle);
    const showPricingBar = styles.pricingSummaryBox !== false;
    const pricingBarBg = styles.pricingSummaryBg || "#DDEDDF";
    const isButtonOutline = styles.buttonStyle === "outline";
    const buttonBg = getButtonBgColor(styles);
    const isFullWidth = styles.buttonWidth !== "auto";
    const isOutline = styles.badgeStyle === "outline";
    const accentColor = styles.primaryColor || "#303030";
    const freeTagColor = styles.bogoFreeTagColor || "#16a34a";
    const bodyFontSize = getFontSize(styles.bodySize);
    const borderStyle = styles.bogoCardBorderStyle || "solid";
    const showBorder = styles.customizeCardStyle
        ? styles.productCardBorder
        : true;
    const cardBg = styles.customizeCardStyle
        ? getCardBgColor(styles)
        : undefined;
    const cardShadow =
        styles.customizeCardStyle && styles.productCardShadow
            ? getShadow("soft")
            : undefined;
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
            <div
                style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 6,
                }}
            >
                {badgeText && (
                    <span
                        style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 6,
                            backgroundColor: isOutline
                                ? "transparent"
                                : accentColor,
                            color: isOutline ? styles.primaryColor : "#ffffff",
                            border: isOutline
                                ? `2px solid ${accentColor}`
                                : "none",
                            fontSize: parseInt(bodyFontSize) - 4,
                            fontWeight: 600,
                            padding: "6px 16px",
                            borderRadius: 20,
                            marginBottom: 10,
                        }}
                    >
                        {badgeText}
                    </span>
                )}
                {title && (
                    <div
                        style={{
                            fontSize: headingFontSize,
                            fontWeight: 600,
                            color: styles.textColor,
                            textAlign: "center",
                        }}
                    >
                        {title}
                    </div>
                )}
                {subtitle && (
                    <div
                        style={{
                            fontSize: bodyFontSize,
                            color: styles.textColor || "#6b7280",
                            opacity: 0.8,
                            textAlign: "center",
                        }}
                    >
                        {subtitle}
                    </div>
                )}
            </div>

            <div style={{
                    display: "flex",
                    gap: spacingValues.gap + 2,
                    marginTop:10,
                    flexDirection: activeDevice === "mobile" ? "column" : "row",
                }}>
                {[
                    {
                        items: triggerProducts,
                        variant: "trigger" as const,
                        badge: triggerBadge,
                        color: styles.primaryColor,
                    },
                    {
                        items: rewardProducts,
                        variant: "reward" as const,
                        badge: rewardBadge,
                        color: styles.savingsColor,
                    },
                ].map(({ items, variant, badge, color }) => (
                    <div
                        key={variant}
                        style={{
                            border: showBorder
                                ? `2px ${borderStyle} ${color}`
                                : "none",
                            borderRadius: cardRadius,
                            padding: spacingValues.padding,
                            position: "relative",
                            backgroundColor: cardBg,
                            flex: 1,
                            minWidth: 0,
                            boxShadow: cardShadow,
                        }}
                    >
                        <span
                            style={{
                                position: "absolute",
                                top: -10,
                                left: 12,
                                backgroundColor: isOutline
                                    ? "transparent"
                                    : color,
                                color: isOutline ? color : "#fff",
                                border: isOutline
                                    ? `2px solid ${color}`
                                    : "none",
                                fontSize: parseInt(bodyFontSize) - 4,
                                fontWeight: 600,
                                padding: "2px 10px",
                                borderRadius: badgeRadius,
                                lineHeight: "16px",
                            }}
                        >
                            {badge}
                        </span>
                        <div
                            style={{
                                display: "grid",
                                gridTemplateColumns:
                                    items.length > 1
                                        ? `repeat(${items.length}, 1fr)`
                                        : "1fr",
                                gap: spacingValues.gap,
                            }}
                        >
                            {items.map((p) => (
                                <ClassicProductItem
                                    key={p.id}
                                    product={p}
                                    isReward={variant === "reward"}
                                    styles={styles}
                                />
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            {pricing?.hasDiscount && showPricingBar && (
                <div
                    style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        backgroundColor: pricingBarBg,
                        borderRadius: cardRadius,
                        padding: `${spacingValues.padding}px`,
                    }}
                >
                    <div>
                        <div
                            style={{
                                fontSize: parseInt(bodyFontSize) - 3,
                                fontWeight: 500,
                                color: freeTagColor,
                                marginBottom: 4,
                            }}
                        >
                            {labels?.bogoYouPayLabel ||
                                DEFAULT_LABELS.bogoYouPayLabel}
                        </div>
                        <div
                            style={{
                                fontSize: parseInt(bodyFontSize) + 4,
                                fontWeight: 600,
                                color: styles.textColor,
                            }}
                        >
                            {pricing.finalPrice}
                        </div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                        <div
                            style={{
                                fontSize: parseInt(bodyFontSize) - 3,
                                fontWeight: 500,
                                color: freeTagColor,
                                marginBottom: 4,
                            }}
                        >
                            {labels?.bogoYouSaveLabel ||
                                DEFAULT_LABELS.bogoYouSaveLabel}
                        </div>
                        <div
                            style={{
                                fontSize: parseInt(bodyFontSize) + 4,
                                fontWeight: 600,
                                color: styles.savingsColor || "#16a34a",
                            }}
                        >
                            {pricing.savingsAmount}
                        </div>
                    </div>
                </div>
            )}

            {cartButtonText && (
                <button
                    style={{
                        width: isFullWidth ? "100%" : "auto",
                        alignSelf: isFullWidth ? undefined : "center",
                        padding: getButtonPadding(styles.buttonSize),
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
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 8,
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
