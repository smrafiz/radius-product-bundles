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
    getImageSize,
} from "@/features/settings";
import { DEFAULT_LABELS } from "@/features/settings/constants/defaults.constants";
import { SPACING_VALUES } from "@/features/settings/constants/defaults.constants";

function SplitProductCard({
    product,
    isReward,
    styles,
    displayOptions,
}: {
    product: PreviewProduct;
    isReward: boolean;
    styles: WidgetLayoutProps["styles"];
    displayOptions: WidgetLayoutProps["displayOptions"];
}) {
    const bodyFontSize = getFontSize(styles.bodySize);
    const cardRadius = getCardRadius(styles.cornerStyle);
    const freeText = DEFAULT_LABELS.bogoFreeText;
    const hasDiscount = isReward && !!product.compareAtPrice;
    const isFreePrice =
        hasDiscount && /^[^1-9]*$/.test(product.price || "");
    const imageSizePx = getImageSize(styles.imageSize);

    return (
        <div
            style={{
                display: "flex",
                gap: 10,
                alignItems: "center",
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
                        backgroundColor: styles.productCardBg || "#f3f4f6",
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
                        fontWeight: 500,
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
                        marginTop: 5,
                    }}
                >
                    {displayOptions.showPrices && (
                    <span
                        style={{
                            fontSize: bodyFontSize,
                            fontWeight: 500,
                            color: hasDiscount
                                ? styles.savingsColor || "#16a34a"
                                : styles.textColor,
                        }}
                    >
                        {isFreePrice ? freeText : product.price}
                    </span>
                    )}
                    {hasDiscount && displayOptions.showComparePrices &&(
                        <span
                            style={{
                                fontSize: parseInt(bodyFontSize) - 2,
                                color: styles.textColor,
                                fontWeight: 500,
                                opacity: 0.5,
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

export function WidgetSplitDeal({
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
    const anyRewardFree = rewardProducts.some(
        (p) => !!p.compareAtPrice && /^[^1-9]*$/.test(p.price || ""),
    );
    const rewardBadge = anyRewardFree
        ? (labels?.bogoFreeText || DEFAULT_LABELS.bogoFreeText)
        : pricing?.hasDiscount && pricing.savingsAmount
          ? `${pricing.savingsAmount} Off`
          : labels?.bogoRewardBadgeText || DEFAULT_LABELS.bogoRewardBadgeText;
    const accentColor = styles.primaryColor || "#303030";
    const isOutline = styles.badgeStyle === "outline";
    const bodyFontSize = getFontSize(styles.bodySize);

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
            <div
                style={{ textAlign: "center", marginBottom: spacingValues.gap }}
            >
                {badgeText && displayOptions.showSavingsBadge && (
                    <div
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
                            fontWeight: 600,
                            color: styles.textColor,
                            margin: 0,
                        }}
                    >
                        {title || DEFAULT_LABELS.headingLabel}
                    </h3>
                )}
                {subtitle && (
                    <p
                        style={{
                            fontSize: bodyFontSize,
                            color: styles.textColor || "#6b7280",
                            opacity: 0.8,
                            margin: "8px 0 0",
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
                    gap: 4,
                    flexDirection: activeDevice === "mobile" ? "column" : "row",
                }}
            >
                {/* Trigger Column */}
                <div
                    style={{
                        flex: 1,
                        minWidth: 0,
                        display: "flex",
                        flexDirection: "column",
                    }}
                >
                    <div
                        style={{
                            fontSize: parseInt(bodyFontSize) - 4,
                            fontWeight: 600,
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
                            borderLeft: `2px solid ${styles.primaryColor || "#303030"}`,
                            borderRight: `2px solid ${styles.primaryColor || "#303030"}`,
                            borderBottom: `2px solid ${styles.primaryColor || "#303030"}`,
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
                                displayOptions={displayOptions}
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
                <div
                    style={{
                        flex: 1,
                        minWidth: 0,
                        display: "flex",
                        flexDirection: "column",
                    }}
                >
                    <div
                        style={{
                            fontSize: parseInt(bodyFontSize) - 4,
                            fontWeight: 600,
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
                            borderLeft: `2px solid ${styles.savingsColor || "#16a34a"}`,
                            borderRight: `2px solid ${styles.savingsColor || "#16a34a"}`,
                            borderBottom: `2px solid ${styles.savingsColor || "#16a34a"}`,
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
                                displayOptions={displayOptions}
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
                                fontSize: parseInt(bodyFontSize) - 4,
                                fontWeight: 600,
                                textTransform: "uppercase" as const,
                                letterSpacing: "0.04em",
                                marginBottom: 2,
                                color: styles.savingsColor || "#15803d",
                            }}
                        >
                            {labels?.bogoYouPayLabel ||
                                DEFAULT_LABELS.bogoYouPayLabel}
                        </span>
                        <span
                            style={{
                                display: "block",
                                fontSize: parseInt(headingFontSize),
                                fontWeight: 600,
                                color: styles.textColor,
                            }}
                        >
                            {pricing.finalPrice}
                        </span>
                    </div>
                    <div style={{ textAlign: "right" }}>
                        <span
                            style={{
                                display: "block",
                                fontSize: parseInt(bodyFontSize) - 4,
                                fontWeight: 600,
                                textTransform: "uppercase" as const,
                                letterSpacing: "0.04em",
                                marginBottom: 2,
                                color: styles.savingsColor || "#15803d",
                            }}
                        >
                            {labels?.bogoYouSaveLabel ||
                                DEFAULT_LABELS.bogoYouSaveLabel}
                        </span>
                        <span
                            style={{
                                display: "block",
                                fontSize: parseInt(headingFontSize),
                                fontWeight: 600,
                                color: styles.savingsColor || "#16a34a",
                            }}
                        >
                            {pricing.savingsAmount}
                        </span>
                    </div>
                </div>
            )}

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
                    {cartButtonText || DEFAULT_LABELS.addToCartText}
                </button>
            )}
        </div>
    );
}
