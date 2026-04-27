"use client";

import { useState } from "react";
import { WidgetLayoutProps, PreviewProduct, PREVIEW_LABELS } from "@/shared";
import {
    getButtonBgColor,
    getButtonRadius,
    getButtonFontSize,
    getButtonPadding,
    getHeadingFontSize,
    getFontSize,
    getCardRadius,
    getBadgeRadius,
    getCardBgColor,
    getImageSize,
} from "@/features/settings";
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
    displayOptions,
    labels,
}: {
    product: PreviewProduct;
    isReward: boolean;
    styles: WidgetLayoutProps["styles"];
    displayOptions: WidgetLayoutProps["displayOptions"];
    labels?: WidgetLayoutProps["labels"];
}) {
    const bodyFontSize = getFontSize(styles.bodySize);
    const cardRadius = getCardRadius(styles.cornerStyle);
    const imageSizePx = getImageSize(styles.imageSize);
    const isHorizontal = styles.imagePosition === "left";
    const freeText = labels?.bogoFreeText || PREVIEW_LABELS.bogoFreeText;
    const hasDiscount = isReward && !!product.compareAtPrice;
    const isFreePrice = hasDiscount && /^[^1-9]*$/.test(product.price || "");
    const isDefaultVariant = product.variantTitle === "Default Title" || product.variantTitle === "Default";
    const displayTitle = product.variantTitle && !isDefaultVariant
        ? `${product.title} / ${product.variantTitle}`
        : product.title;

    const titleEl =
        displayOptions.enableHyperLink && product.url ? (
            <a href={product.url} className="hover:underline">
                {displayTitle}
            </a>
        ) : (
            <span>{displayTitle}</span>
        );

    const imageBlock = product.image && displayOptions.showImages && (
        <div
            style={{
                width: isHorizontal ? `calc(${imageSizePx} - 10px)` : "100%",
                height: isHorizontal ? `calc(${imageSizePx} - 10px)` : "100%",
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
                {titleEl}
            </div>
            <div
                style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    marginTop: 6,
                }}
            >
                {hasDiscount && displayOptions.showComparePrices && (
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
                {displayOptions.showPrices && (
                    <span
                        style={{
                            fontSize: bodyFontSize,
                            fontWeight: 600,
                            color: hasDiscount
                                ? styles.bogoFreeTagColor || "#16a34a"
                                : styles.textColor,
                        }}
                    >
                        {isFreePrice ? freeText : product.price}
                    </span>
                )}
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

function ClassicSlider({
    items,
    isReward,
    styles,
    displayOptions,
    labels,
    dotColor,
}: {
    items: PreviewProduct[];
    isReward: boolean;
    styles: WidgetLayoutProps["styles"];
    displayOptions: WidgetLayoutProps["displayOptions"];
    labels?: WidgetLayoutProps["labels"];
    dotColor?: string;
}) {
    const [index, setIndex] = useState(0);
    if (items.length === 0) return null;
    if (items.length === 1) {
        return (
            <ClassicProductItem
                product={items[0]}
                isReward={isReward}
                styles={styles}
                displayOptions={displayOptions}
                labels={labels}
            />
        );
    }
    return (
        <div>
            <ClassicProductItem
                product={items[index]}
                isReward={isReward}
                styles={styles}
                displayOptions={displayOptions}
                labels={labels}
            />
            <div
                style={{
                    display: "flex",
                    justifyContent: "center",
                    gap: 6,
                    marginTop: 10,
                }}
            >
                {items.map((_, i) => (
                    <button
                        key={i}
                        onClick={() => setIndex(i)}
                        style={{
                            width: 6,
                            height: 6,
                            borderRadius: "50%",
                            border: "none",
                            padding: 0,
                            cursor: "pointer",
                            backgroundColor:
                                i === index
                                    ? dotColor || "#303030"
                                    : "#d1d5db",
                            transition: "background-color 0.2s",
                        }}
                    />
                ))}
            </div>
        </div>
    );
}

export function WidgetClassicCard({
    products,
    styles,
    displayOptions,
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
    const badgeRadius = getBadgeRadius(styles.cornerStyle);
    const showPricingBar = styles.pricingSummaryBox;
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
    const triggerBadge =
        labels?.bogoTriggerBadgeText || PREVIEW_LABELS.bogoTriggerBadgeText;
    const anyRewardFree = rewardProducts.some(
        (p) => !!p.compareAtPrice && /^[^1-9]*$/.test(p.price || ""),
    );
    const rewardBadge = anyRewardFree
        ? labels?.bogoFreeText || PREVIEW_LABELS.bogoFreeText
        : pricing?.hasDiscount && pricing.savingsAmount
          ? `${pricing.savingsAmount} Off`
          : labels?.bogoRewardBadgeText || PREVIEW_LABELS.bogoRewardBadgeText;

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
                {badgeText && displayOptions.showSavingsBadge && (
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
                        {title || PREVIEW_LABELS.headingLabel}
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

            <div
                style={{
                    display: "grid",
                    gridTemplateColumns:
                        (styles.splitDealStyle ?? "row") === "column" ? "1fr" : "1fr 1fr",
                    gap: spacingValues.gap + 2,
                    marginTop: 10,
                }}
            >
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
                            minWidth: 0,
                        }}
                    >
                        {displayOptions.showSavingsBadge && (
                            <span
                                style={{
                                    position: "absolute",
                                    top: -10,
                                    left: 12,
                                    backgroundColor: color,
                                    color: "#ffffff",
                                    fontSize: parseInt(bodyFontSize) - 4,
                                    fontWeight: 600,
                                    padding: "2px 10px",
                                    borderRadius: badgeRadius,
                                    lineHeight: "16px",
                                }}
                            >
                                {badge}
                            </span>
                        )}
                        <ClassicSlider
                            items={items}
                            isReward={variant === "reward"}
                            styles={styles}
                            displayOptions={displayOptions}
                            labels={labels}
                            dotColor={color}
                        />
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
                                PREVIEW_LABELS.bogoYouPayLabel}
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
                    {displayOptions.showSavings && (
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
                                    PREVIEW_LABELS.bogoYouSaveLabel}
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
                    )}
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
                    {cartButtonText || PREVIEW_LABELS.addToCartText}
                </button>
            )}
        </div>
    );
}
