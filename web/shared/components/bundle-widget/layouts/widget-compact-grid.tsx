"use client";

import { WidgetLayoutProps } from "@/shared";
import {
    getButtonBgColor,
    getButtonRadius,
    getButtonFontSize,
    getButtonPadding,
    getFontSize,
    getCardRadius,
} from "@/features/settings";
import { DEFAULT_LABELS } from "@/features/settings/constants/defaults.constants";

function ProductTile({
    product,
    variant,
    styles,
    labels,
}: {
    product: { title: string; image?: string; price: string; compareAtPrice?: string };
    variant: "trigger" | "reward";
    styles: WidgetLayoutProps["styles"];
    labels?: WidgetLayoutProps["labels"];
}) {
    const isTrigger = variant === "trigger";
    const isReward = !isTrigger;
    const primaryColor = styles.primaryColor || "#e0598b";
    const savingsColor = styles.savingsColor || "#16a34a";
    const accentColor = isTrigger ? primaryColor : savingsColor;
    const bodyFontSize = getFontSize(styles.bodySize);
    const cardRadius = getCardRadius(styles.cornerStyle);
    const freeTagColor = styles.bogoFreeTagColor || "#16a34a";
    const youPayLabel = labels?.bogoYouPayLabel || DEFAULT_LABELS.bogoYouPayLabel;
    const freeText = labels?.bogoFreeText || DEFAULT_LABELS.bogoFreeText;
    const hasDiscount = isReward && !!product.compareAtPrice;
    const isFreePrice = hasDiscount && (product.price === "$0.00" || product.price === "$0");
    const rewardBadgeText = labels?.bogoRewardBadgeText || DEFAULT_LABELS.bogoRewardBadgeText;

    return (
        <div
            style={{
                flex: 1,
                minWidth: 0,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 8,
                padding: "16px 12px 12px",
                borderRadius: cardRadius,
                background: "#fff",
                border: `1.5px solid ${accentColor}22`,
            }}
        >
            {product.image && (
                <div
                    style={{
                        width: 80,
                        height: 80,
                        borderRadius: cardRadius,
                        overflow: "hidden",
                        background: "#f9fafb",
                        border: `2px solid ${accentColor}33`,
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

            <span
                style={{
                    fontSize: 10,
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: 0.8,
                    color: accentColor,
                    background: `${accentColor}12`,
                    padding: "3px 10px",
                    borderRadius: 20,
                    lineHeight: "14px",
                }}
            >
                {isTrigger ? youPayLabel : (isFreePrice ? freeText : rewardBadgeText)}
            </span>

            <div
                style={{
                    fontSize: bodyFontSize,
                    fontWeight: 600,
                    color: styles.textColor,
                    textAlign: "center",
                    lineHeight: "1.3",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                    maxWidth: "100%",
                }}
            >
                {product.title}
            </div>

            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 1 }}>
                <span
                    style={{
                        fontSize: 16,
                        fontWeight: 700,
                        color: hasDiscount ? freeTagColor : styles.textColor,
                    }}
                >
                    {isFreePrice ? freeText : product.price}
                </span>
                {hasDiscount && product.compareAtPrice && (
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
        </div>
    );
}

export function WidgetCompactGrid({
    products,
    styles,
    pricing,
    cartButtonText,
    title,
    badgeText,
    labels,
}: WidgetLayoutProps) {
    const triggerProducts = products.filter((p) => p.role === "TRIGGER");
    const rewardProducts = products.filter((p) => p.role === "REWARD");
    const primaryColor = styles.primaryColor || "#e0598b";
    const savingsColor = styles.savingsColor || "#16a34a";
    const cardRadius = getCardRadius(styles.cornerStyle);
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
        <div
            style={{
                display: "flex",
                flexDirection: "column",
                borderRadius: cardRadius,
                overflow: "hidden",
                background: "#f8f9fa",
            }}
        >
            {/* Deal banner */}
            <div
                style={{
                    background: `linear-gradient(135deg, ${primaryColor}, ${primaryColor}CC)`,
                    padding: "14px 20px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                }}
            >
                <span
                    style={{
                        color: "#fff",
                        fontSize: 15,
                        fontWeight: 700,
                    }}
                >
                    {title || "Special Offer"}
                </span>
                {badgeText && pricing?.hasDiscount && (
                    <span
                        style={{
                            background: "rgba(255,255,255,0.2)",
                            color: "#fff",
                            fontSize: 11,
                            fontWeight: 700,
                            padding: "4px 12px",
                            borderRadius: 20,
                            letterSpacing: 0.3,
                        }}
                    >
                        {badgeText}
                    </span>
                )}
            </div>

            {/* Product tiles */}
            <div
                style={{
                    display: "flex",
                    alignItems: "stretch",
                    gap: 0,
                    padding: "16px 16px 12px",
                }}
            >
                <div style={{ display: "flex", flex: triggerProducts.length, gap: 8, minWidth: 0 }}>
                    {triggerProducts.map((p) => (
                        <ProductTile key={p.id} product={p} variant="trigger" styles={styles} labels={labels} />
                    ))}
                </div>

                <div
                    style={{
                        width: 32,
                        flexShrink: 0,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                    }}
                >
                    <div
                        style={{
                            width: 32,
                            height: 32,
                            borderRadius: "50%",
                            background: "#fff",
                            border: "2px solid #e5e7eb",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: 16,
                            fontWeight: 700,
                            color: "#9ca3af",
                        }}
                    >
                        +
                    </div>
                </div>

                <div style={{ display: "flex", flex: rewardProducts.length, gap: 8, minWidth: 0 }}>
                    {rewardProducts.map((p) => (
                        <ProductTile key={p.id} product={p} variant="reward" styles={styles} labels={labels} />
                    ))}
                </div>
            </div>

            {/* Footer */}
            <div
                style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "0 16px 16px",
                    gap: 12,
                }}
            >
                {pricing && (
                    <div style={{ display: "flex", flexDirection: "column" }}>
                        <span style={{ fontSize: 11, color: "#6b7280", fontWeight: 500 }}>
                            {labels?.bogoTotalLabel || DEFAULT_LABELS.bogoTotalLabel}
                        </span>
                        <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
                            <span style={{ fontSize: 20, fontWeight: 700, color: styles.textColor }}>
                                {pricing.finalPrice}
                            </span>
                            {pricing.hasDiscount && (
                                <span
                                    style={{
                                        fontSize: 13,
                                        fontWeight: 600,
                                        color: savingsColor,
                                    }}
                                >
                                    {(labels?.bogoSaveText || DEFAULT_LABELS.bogoSaveText).replace("{amount}", pricing.savingsAmount || "")}
                                </span>
                            )}
                        </div>
                    </div>
                )}

                {cartButtonText && (
                    <button
                        style={{
                            display: "inline-flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: 6,
                            padding: getButtonPadding(styles.buttonSize),
                            border: isButtonOutline ? `2px solid ${buttonBg}` : "none",
                            borderRadius: getButtonRadius(styles.cornerStyle),
                            background: isButtonOutline ? "transparent" : buttonBg,
                            color: isButtonOutline ? buttonBg : "#fff",
                            fontSize: getButtonFontSize(styles.buttonSize),
                            fontWeight: 600,
                            cursor: "pointer",
                            whiteSpace: "nowrap",
                        }}
                    >
                        <svg
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2.5"
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
        </div>
    );
}
