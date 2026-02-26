"use client";

import { WidgetLayoutProps, PreviewProduct } from "@/shared";
import { getButtonBgColor, getButtonRadius, getButtonFontSize, getHeadingFontSize } from "@/features/settings";

const TRIGGER_BADGE_BG = "#f97316";
const REWARD_BADGE_BG = "#16a34a";
const PRICING_BAR_BG = "#DDEDDF";

function ClassicProductCard({
    product,
    variant,
    styles,
}: {
    product: PreviewProduct;
    variant: "trigger" | "reward";
    styles: WidgetLayoutProps["styles"];
}) {
    const isTrigger = variant === "trigger";
    const borderColor = isTrigger ? styles.primaryColor : styles.savingsColor;
    const badgeBg = isTrigger ? styles.primaryColor : styles.savingsColor;
    const badgeText = isTrigger ? "You Buy" : "You Get FREE";
    const isFree = !isTrigger;

    return (
        <div
            style={{
                border: `2px solid ${borderColor}`,
                borderRadius: 12,
                padding: 16,
                position: "relative",
                flex: 1,
                minWidth: 0,
            }}
        >
            <span
                style={{
                    position: "absolute",
                    top: -10,
                    left: 12,
                    backgroundColor: badgeBg,
                    color: "#fff",
                    fontSize: 11,
                    fontWeight: 600,
                    padding: "2px 10px",
                    borderRadius: 4,
                    lineHeight: "16px",
                }}
            >
                {badgeText}
            </span>

            {product.image && (
                <div
                    style={{
                        width: "100%",
                        aspectRatio: "1/1",
                        borderRadius: 8,
                        overflow: "hidden",
                        marginBottom: 10,
                        marginTop: 8,
                        backgroundColor: "#f9fafb",
                    }}
                >
                    <img
                        src={product.image}
                        alt={product.title}
                        style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                        }}
                    />
                </div>
            )}

            <div
                style={{
                    fontSize: 13,
                    fontWeight: 600,
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
                {isFree && (
                    <span
                        style={{
                            fontSize: 13,
                            color: "#9ca3af",
                            textDecoration: "line-through",
                            fontWeight: 500
                        }}
                    >
                        {product.price}
                    </span>
                )}
                <span
                    style={{
                        fontSize: 16,
                        fontWeight: 700,
                        color: isFree ? REWARD_BADGE_BG : styles.textColor,
                    }}
                >
                    {isFree ? "FREE" : product.price}
                </span>
            </div>
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
}: WidgetLayoutProps) {
    const triggerProducts = products.filter((p) => p.role === "TRIGGER");
    const rewardProducts = products.filter((p) => p.role === "REWARD");
    const headingFontSize = getHeadingFontSize(styles.headingSize);

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
        <div style={{ display: "flex", flexDirection: "column", gap: 30 }}>
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
                            backgroundColor:
                                styles.primaryColor || TRIGGER_BADGE_BG,
                            color: "#fff",
                            fontSize: 13,
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
                            fontWeight: 700,
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
                            fontSize: 14,
                            color: "#6b7280",
                            textAlign: "center",
                        }}
                    >
                        {subtitle}
                    </div>
                )}
            </div>

            <div style={{ display: "flex", gap: 14 }}>
                {triggerProducts.map((p) => (
                    <ClassicProductCard
                        key={p.id}
                        product={p}
                        variant="trigger"
                        styles={styles}
                    />
                ))}
                {rewardProducts.map((p) => (
                    <ClassicProductCard
                        key={p.id}
                        product={p}
                        variant="reward"
                        styles={styles}
                    />
                ))}
            </div>

            {pricing?.hasDiscount && (
                <div
                    style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        backgroundColor: PRICING_BAR_BG,
                        borderRadius: 10,
                        padding: "14px 20px",
                    }}
                >
                    <div>
                        <div
                            style={{
                                fontSize: 12,
                                fontWeight: 500,
                                color: "#166534",
                                marginBottom: 2,
                            }}
                        >
                            You Pay Only
                        </div>
                        <div
                            style={{
                                fontSize: 20,
                                fontWeight: 700,
                                color: "#111827",
                            }}
                        >
                            {pricing.finalPrice}
                        </div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                        <div
                            style={{
                                fontSize: 12,
                                fontWeight: 500,
                                color: "#15803d",
                                marginBottom: 2,
                            }}
                        >
                            You Save
                        </div>
                        <div
                            style={{
                                fontSize: 20,
                                fontWeight: 700,
                                color: "#16a34a",
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
                        width: "100%",
                        padding: "14px 24px",
                        backgroundColor: getButtonBgColor(styles),
                        color: "#fff",
                        border: "none",
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
