"use client";

import { WidgetLayoutProps, PreviewProduct } from "@/shared";
import { getButtonBgColor, getButtonRadius, getButtonFontSize } from "@/features/settings";

const TRIGGER_BADGE_BG = "#f97316";
const REWARD_BADGE_BG = "#16a34a";
const PRICING_BAR_BG = "#f0fdf4";

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
    const borderColor = isTrigger ? TRIGGER_BADGE_BG : REWARD_BADGE_BG;
    const badgeBg = isTrigger ? TRIGGER_BADGE_BG : REWARD_BADGE_BG;
    const badgeText = isTrigger ? "You Buy" : "You Get FREE";
    const isFree = !isTrigger && product.price === "$0.00";

    return (
        <div
            style={{
                border: `2px solid ${borderColor}`,
                borderRadius: 12,
                padding: 16,
                position: "relative",
                backgroundColor: "#fff",
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

            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                {product.compareAtPrice && (
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
                <span
                    style={{
                        fontSize: 14,
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
}: WidgetLayoutProps) {
    const triggerProducts = products.filter((p) => p.role === "TRIGGER");
    const rewardProducts = products.filter((p) => p.role === "REWARD");

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
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={{ display: "flex", gap: 12 }}>
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
                        borderRadius: 8,
                        padding: "10px 16px",
                        fontSize: 13,
                        fontWeight: 600,
                    }}
                >
                    <span style={{ color: "#166534" }}>
                        You Pay Only: {pricing.finalPrice}
                    </span>
                    <span style={{ color: "#15803d" }}>
                        You Save: {pricing.savingsAmount}
                    </span>
                </div>
            )}

            {cartButtonText && (
                <button
                    style={{
                        width: "100%",
                        padding: "12px 24px",
                        backgroundColor: getButtonBgColor(styles),
                        color: "#fff",
                        border: "none",
                        borderRadius: getButtonRadius(styles.cornerStyle),
                        fontSize: getButtonFontSize(styles.buttonSize),
                        fontWeight: 600,
                        cursor: "pointer",
                    }}
                >
                    {cartButtonText}
                </button>
            )}
        </div>
    );
}
