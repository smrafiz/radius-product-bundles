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

function SleekProductCard({
    product,
    variant,
    styles,
    displayOptions,
    labels,
    pricing,
}: {
    product: PreviewProduct;
    variant: "trigger" | "reward";
    styles: WidgetLayoutProps["styles"];
    displayOptions: WidgetLayoutProps["displayOptions"];
    labels?: WidgetLayoutProps["labels"];
    pricing?: WidgetLayoutProps["pricing"];
}) {
    const isTrigger = variant === "trigger";
    const isReward = !isTrigger;
    const imageSizePx = getImageSize(styles.imageSize);
    const savingsColor = styles.savingsColor || "#16a34a";
    const borderRadius = getCardRadius(styles.cornerStyle);
    const bodyFontSize = getFontSize(styles.bodySize);
    const freeTagColor = styles.bogoFreeTagColor || "#16a34a";
    const freeText = labels?.bogoFreeText || DEFAULT_LABELS.bogoFreeText;
    const hasDiscount = isReward && !!product.compareAtPrice;
    const isFreePrice =
        hasDiscount && /^[^1-9]*$/.test(product.price || "");
    const rewardBadgeText = isFreePrice
        ? freeText
        : pricing?.hasDiscount && pricing.savingsAmount
          ? `${pricing.savingsAmount} Off`
          : labels?.bogoRewardBadgeText || DEFAULT_LABELS.bogoRewardBadgeText;

    const bgBase = styles.backgroundColor || "#fff";
    const cardStyle: React.CSSProperties = isTrigger
        ? {
              background: styles.productCardBg || bgBase,
              border: `1px solid ${styles.borderColor || "#e5e7eb"}`,
          }
        : {
              background: hasDiscount
                  ? `linear-gradient(to right, ${savingsColor}1A, ${bgBase})`
                  : styles.productCardBg || bgBase,
              border: hasDiscount
                  ? `1px solid ${savingsColor}33`
                  : `1px solid ${styles.borderColor || "#e5e7eb"}`,
          };

    return (
        <div
            style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: "12px 16px",
                borderRadius,
                ...cardStyle,
            }}
        >
            {product.image && displayOptions.showImages && (
                <div
                    style={{
                        width: `calc(${imageSizePx} - 20px)`,
                        height: `calc(${imageSizePx} - 20px)`,
                        flexShrink: 0,
                        borderRadius: 8,
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
                    gap: 2,
                }}
            >
                <div
                    style={{
                        fontSize: bodyFontSize,
                        fontWeight: 500,
                        color: styles.textColor,
                        lineHeight: "1.3",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                    }}
                >
                    {product.title}
                </div>
                {isTrigger && displayOptions.showSavingsBadge ? (

                    <span
                        style={{
                            fontSize: parseInt(bodyFontSize) - 3,
                            color: styles.textColor,
                            fontWeight: 500,
                            opacity: 0.7,
                        }}
                    >
                        {labels?.bogoYouPayLabel ||
                            DEFAULT_LABELS.bogoYouPayLabel}
                    </span>
                ) : (
                    hasDiscount && displayOptions.showSavingsBadge && (
                        <span
                            style={{
                                display: "inline-block",
                                fontSize: parseInt(bodyFontSize) - 3,
                                fontWeight: 500,
                                color: savingsColor,
                                background: `${savingsColor}1F`,
                                padding: "1px 8px",
                                borderRadius: 10,
                                lineHeight: "18px",
                                width: "fit-content",
                            }}
                        >
                            {rewardBadgeText}
                        </span>
                    )
                )}
            </div>

            <div
                style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "flex-end",
                    flexShrink: 0,
                    gap: 1,
                }}
            >
                {displayOptions.showPrices && (
                <span
                    style={{
                        fontSize: bodyFontSize,
                        fontWeight: 500,
                        color: hasDiscount ? freeTagColor : styles.textColor,
                    }}
                >
                    {isFreePrice ? freeText : product.price}
                </span>
                )}
                {hasDiscount && product.compareAtPrice && displayOptions.showComparePrices && (
                    <span
                        style={{
                            fontSize: parseInt(bodyFontSize) - 3,
                            color: styles.textColor || "#9ca3af",
                            opacity: 0.5,
                            textDecoration: "line-through",
                            fontWeight: 500,
                        }}
                    >
                        {product.compareAtPrice}
                    </span>
                )}
            </div>
        </div>
    );
}

export function WidgetSleek({
    products,
    styles,
    displayOptions,
    pricing,
    cartButtonText,
    title,
    labels,
}: WidgetLayoutProps) {
    const triggerProducts = products.filter((p) => p.role === "TRIGGER");
    const rewardProducts = products.filter((p) => p.role === "REWARD");
    const headingFontSize = getHeadingFontSize(styles.headingSize);
    const isButtonOutline = styles.buttonStyle === "outline";
    const buttonBg = getButtonBgColor(styles);

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
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
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
                    {title || DEFAULT_LABELS.headingLabel}
                </h3>
            )}

            {triggerProducts.map((p) => (
                <SleekProductCard
                    key={p.id}
                    product={p}
                    variant="trigger"
                    styles={styles}
                    labels={labels}
                    pricing={pricing}
                    displayOptions={displayOptions}
                />
            ))}

            <div
                style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    padding: "4px 0",
                }}
            >
                <div style={{ flex: 1, height: 1, background: styles.borderColor || "#e5e7eb" }} />
                <div
                    style={{
                        width: 28,
                        height: 28,
                        borderRadius: "50%",
                        background: styles.backgroundColor || "#fff",
                        border: `1.5px solid ${styles.borderColor || "#e5e7eb"}`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 15,
                        fontWeight: 700,
                        color: styles.textColor || "#9ca3af",
                        flexShrink: 0,
                    }}
                >
                    +
                </div>
                <div style={{ flex: 1, height: 1, background: styles.borderColor || "#e5e7eb" }} />
            </div>

            {rewardProducts.map((p) => (
                <SleekProductCard
                    key={p.id}
                    product={p}
                    variant="reward"
                    styles={styles}
                    labels={labels}
                    pricing={pricing}
                    displayOptions={displayOptions}
                />
            ))}

            <div
                style={{
                    borderTop: `1px dashed ${styles.borderColor || "#e5e7eb"}`,
                }}
            />

            <div
                style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 12,
                    paddingTop: 4,
                }}
            >
                {pricing && (
                    <span
                        style={{
                            fontSize: parseInt(headingFontSize) - 2,
                            fontWeight: 600,
                            color: styles.textColor,
                        }}
                    >
                        {labels?.bogoTotalLabel ||
                            DEFAULT_LABELS.bogoTotalLabel}
                        : {pricing.finalPrice}
                    </span>
                )}

                {cartButtonText && (
                    <button
                        style={{
                            display: "inline-flex",
                            alignItems: "center",
                            justifyContent: "center",
                            padding: getButtonPadding(styles.buttonSize),
                            border: isButtonOutline
                                ? `2px solid ${buttonBg}`
                                : "none",
                            borderRadius: getButtonRadius(styles.cornerStyle),
                            background: isButtonOutline
                                ? "transparent"
                                : buttonBg,
                            color: isButtonOutline ? buttonBg : "#fff",
                            fontSize: getButtonFontSize(styles.buttonSize),
                            fontWeight: 600,
                            cursor: "pointer",
                            whiteSpace: "nowrap",
                        }}
                    >
                        {cartButtonText || DEFAULT_LABELS.addToCartText}
                    </button>
                )}
            </div>
        </div>
    );
}
