"use client";

import { WidgetLayoutProps, PreviewProduct } from "@/shared";
import {
    getButtonBgColor,
    getButtonRadius,
    getCardRadius,
    getHeadingFontSize,
    getFontSize,
} from "@/features/settings";
import { DEFAULT_LABELS } from "@/features/settings/constants/defaults.constants";

const LOCK_SVG = (
    <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
    >
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
);

const CART_SVG = (
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
);

function ChecklistTriggerItem({
    product,
    styles,
    displayOptions,
}: {
    product: PreviewProduct;
    styles: WidgetLayoutProps["styles"];
    displayOptions: WidgetLayoutProps["displayOptions"];
}) {
    const bodyFontSize = getFontSize(styles.bodySize);
    const cardRadius = getCardRadius(styles.cornerStyle);

    return (
        <div
            style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: 12,
                border: `2px solid ${styles.borderColor || "#d1d5db"}`,
                borderRadius: cardRadius,
                background: styles.productCardBg || styles.backgroundColor || "#fff",
            }}
        >
            <div
                style={{
                    width: 20,
                    height: 20,
                    minWidth: 20,
                    borderRadius: 4,
                    border: `2px solid ${styles.borderColor || "#d1d5db"}`,
                    background: styles.backgroundColor || "#fff",
                }}
            />
            {product.image && displayOptions.showImages && (
                <div
                    style={{
                        width: 56,
                        height: 56,
                        minWidth: 56,
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
            <div style={{ flex: 1, minWidth: 0 }}>
                <div
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
                </div>
            </div>
            {displayOptions.showPrices && (
            <div
                style={{
                    fontSize: bodyFontSize,
                    fontWeight: 500,
                    color: styles.textColor,
                    whiteSpace: "nowrap",
                }}
            >
                {product.price}
            </div>
                )}
            <div
                style={{
                    color: styles.textColor || "#9ca3af",
                    opacity: 0.4,
                    display: "flex",
                    alignItems: "center",
                    flexShrink: 0,
                }}
            >
                <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                >
                    <polyline points="9 18 15 12 9 6" />
                </svg>
            </div>
        </div>
    );
}

function ChecklistRewardItem({
    product,
    styles,
    displayOptions,
}: {
    product: PreviewProduct;
    styles: WidgetLayoutProps["styles"];
    displayOptions: WidgetLayoutProps["displayOptions"];
}) {
    const bodyFontSize = getFontSize(styles.bodySize);
    const cardRadius = getCardRadius(styles.cornerStyle);
    const freeText = DEFAULT_LABELS.bogoFreeText;
    const hasDiscount = !!product.compareAtPrice;
    const isFreePrice =
        hasDiscount && (product.price === "$0.00" || product.price === "$0");

    return (
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            {product.image && displayOptions.showImages && (
                <div
                    style={{
                        width: 48,
                        height: 48,
                        minWidth: 48,
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
            <div style={{ flex: 1, minWidth: 0 }}>
                <div
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
                </div>
                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                        marginTop: 2,
                    }}
                >
                    {displayOptions.showPrices && (
                    <span
                        style={{
                            fontSize: bodyFontSize,
                            fontWeight: 500,
                            color: styles.savingsColor || "#16a34a",
                        }}
                    >
                        {isFreePrice ? freeText : product.price}
                    </span>
                    )}
                    {hasDiscount && displayOptions.showComparePrices && (
                        <span
                            style={{
                                fontSize: parseInt(bodyFontSize) - 3,
                                color: styles.textColor || "#9ca3af",
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

export function WidgetChecklist({
    products,
    styles,
    displayOptions,
    pricing,
    cartButtonText,
    title,
    subtitle,
    labels,
}: WidgetLayoutProps) {
    const triggerProducts = products.filter((p) => p.role === "TRIGGER");
    const rewardProducts = products.filter((p) => p.role === "REWARD");
    const headingFontSize = getHeadingFontSize(styles.headingSize);
    const bodyFontSize = getFontSize(styles.bodySize);
    const cardRadius = getCardRadius(styles.cornerStyle);
    const buttonBg = getButtonBgColor(styles);
    const buttonRadius = getButtonRadius(styles.cornerStyle);
    const isFullWidth = styles.buttonWidth === "full";

    const totalTriggers = triggerProducts.length;
    const progress = 0;
    const isUnlocked = false;
    const progressPercent = 0;
    const freeText = labels?.bogoFreeText || DEFAULT_LABELS.bogoFreeText;
    const lockedLabel =
        labels?.checklistLockedLabel || DEFAULT_LABELS.checklistLockedLabel;
    const progressLabel = (
        labels?.checklistProgressText || DEFAULT_LABELS.checklistProgressText
    )
        .replace("{count}", String(progress))
        .replace("{total}", String(totalTriggers));
    const hintLabel = (
        labels?.checklistHintText || DEFAULT_LABELS.checklistHintText
    ).replace("{remaining}", String(totalTriggers));
    const pricingLockedLabel =
        labels?.checklistPricingLockedText ||
        DEFAULT_LABELS.checklistPricingLockedText;

    let rewardBadgeText =
        labels?.bogoRewardBadgeText || DEFAULT_LABELS.bogoRewardBadgeText;
    if (pricing?.hasDiscount && pricing.savingsPercentage === 100) {
        rewardBadgeText = freeText;
    }

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
                gap: 16,
            }}
        >
            {/* Progress Section */}
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {title && (
                    <div
                        style={{
                            fontSize: headingFontSize,
                            fontWeight: 600,
                            color: styles.textColor,
                        }}
                    >
                        {title}
                    </div>
                )}
                {subtitle && (
                    <div style={{
                        fontSize: bodyFontSize,
                        color: styles.textColor,
                        margin: "0 0 8px",
                        lineHeight: "1.3",
                        opacity: 0.8,
                    }}>
                        {subtitle}
                    </div>
                )}
                <div
                    style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                    }}
                >
                    <span
                        style={{
                            fontSize: parseInt(bodyFontSize) - 2,
                            fontWeight: 500,
                            color: styles.primaryColor || "#f97316",
                        }}
                    >
                        {progressLabel}
                    </span>
                    <span
                        style={{
                            fontSize: parseInt(bodyFontSize) - 2,
                            fontWeight: 500,
                            color: styles.primaryColor || "#f97316",
                        }}
                    >
                        {hintLabel}
                    </span>
                </div>
                <div
                    style={{
                        width: "100%",
                        height: 8,
                        background: styles.borderColor || "#e5e7eb",
                        borderRadius: 4,
                        overflow: "hidden",
                    }}
                >
                    <div
                        style={{
                            height: "100%",
                            width: `${progressPercent}%`,
                            background: styles.primaryColor || "#f97316",
                            borderRadius: 4,
                            transition: "width 0.4s ease",
                        }}
                    />
                </div>
            </div>

            {/* Trigger Section */}
            <div
                style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 8,
                }}
            >
                <span
                    style={{
                        fontSize: bodyFontSize,
                        fontWeight: 600,
                        textTransform: "uppercase",
                        letterSpacing: "0.05em",
                        color: styles.textColor,
                        opacity: 0.8,
                    }}
                >
                    Buy
                </span>
                {triggerProducts.map((p) => (
                    <ChecklistTriggerItem
                        key={p.id}
                        product={p}
                        styles={styles}
                        displayOptions={displayOptions}
                    />
                ))}
            </div>

            {/* Reward Section */}
            <div
                style={{
                    border: isUnlocked
                        ? `2px dashed ${styles.savingsColor || "#16a34a"}`
                        : `2px solid ${styles.borderColor || "#d1d5db"}`,
                    borderRadius: cardRadius,
                    padding: 16,
                    background: styles.productCardBg || styles.backgroundColor || "#fff",
                    opacity: isUnlocked ? 1 : 0.5,
                    transition: "all 0.3s ease",
                }}
            >
                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        marginBottom: 12,
                    }}
                >
                    <span
                        style={{
                            fontSize: parseInt(bodyFontSize) - 2,
                            fontWeight: 500,
                            color: styles.textColor,
                        }}
                    >
                        {lockedLabel}
                    </span>
                    {displayOptions.showSavingsBadge && (
                    <span
                        style={{
                            fontSize: parseInt(bodyFontSize) - 5,
                            fontWeight: 600,
                            padding: "2px 10px",
                            borderRadius: 12,
                            color: "#fff",
                            background: styles.savingsColor || "#16a34a",
                        }}
                    >
                        {rewardBadgeText}
                    </span>
                        )}
                    <span
                        style={{
                            marginLeft: "auto",
                            color: isUnlocked
                                ? styles.savingsColor || "#16a34a"
                                : styles.textColor || "#9ca3af",
                            opacity: isUnlocked ? 1 : 0.4,
                        }}
                    >
                        {LOCK_SVG}
                    </span>
                </div>
                <div
                    style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 8,
                    }}
                >
                    {rewardProducts.map((p) => (
                        <ChecklistRewardItem
                            key={p.id}
                            product={p}
                            styles={styles}
                            displayOptions={displayOptions}
                        />
                    ))}
                </div>
            </div>

            {/* Pricing Summary Box */}
            {pricing && (
                <div
                    style={{
                        border: `1px solid ${styles.borderColor || "#e5e7eb"}`,
                        borderRadius: getCardRadius(styles.cornerStyle),
                        padding: 16,
                        background: styles.productCardBg || styles.backgroundColor || "#f9fafb",
                        opacity: 0.5,
                        transition: "all 0.3s ease",
                    }}
                >
                    <div
                        style={{
                            fontSize: 13,
                            color: styles.textColor || "#9ca3af",
                            textAlign: "center",
                            padding: "4px 0",
                        }}
                    >
                        {pricingLockedLabel}
                    </div>
                </div>
            )}

            {/* CTA Button */}
            {cartButtonText && (
                <button
                    style={{
                        width: isFullWidth ? "100%" : "auto",
                        padding: "14px 24px",
                        fontSize: 15,
                        fontWeight: 700,
                        borderRadius: buttonRadius,
                        border: "none",
                        background: isUnlocked ? buttonBg : styles.borderColor || "#e5e7eb",
                        color: isUnlocked ? "#fff" : styles.textColor || "#9ca3af",
                        cursor: isUnlocked ? "pointer" : "not-allowed",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 8,
                    }}
                >
                    {CART_SVG}
                    {cartButtonText}
                </button>
            )}
        </div>
    );
}
