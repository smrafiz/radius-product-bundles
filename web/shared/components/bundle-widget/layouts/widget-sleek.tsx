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
} from "@/features/settings";
import { DEFAULT_LABELS } from "@/features/settings/constants/defaults.constants";

function SleekProductCard({
    product,
    variant,
    styles,
}: {
    product: PreviewProduct;
    variant: "trigger" | "reward";
    styles: WidgetLayoutProps["styles"];
}) {
    const isTrigger = variant === "trigger";
    const savingsColor = styles.savingsColor || "#16a34a";
    const borderRadius = getCardRadius(styles.cornerStyle);
    const bodyFontSize = getFontSize(styles.bodySize);
    const isFree = !isTrigger;
    const freeTagColor = styles.bogoFreeTagColor || "#16a34a";

    const cardStyle: React.CSSProperties = isTrigger
        ? {
              background: styles.productCardBg || "#fff",
              border: `1px solid ${styles.borderColor || "#e5e7eb"}`,
          }
        : {
              background: `linear-gradient(to right, ${savingsColor}1A, white)`,
              border: `1px solid ${savingsColor}33`,
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
            {product.image && (
                <div
                    style={{
                        width: 48,
                        height: 48,
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

            <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 2 }}>
                <div
                    style={{
                        fontSize: bodyFontSize,
                        fontWeight: 600,
                        color: styles.textColor,
                        lineHeight: "1.3",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                    }}
                >
                    {product.title}
                </div>
                {isTrigger ? (
                    <span style={{ fontSize: 12, color: "#9ca3af", fontWeight: 500 }}>
                        {DEFAULT_LABELS.bogoYouPayLabel}
                    </span>
                ) : (
                    isFree && (
                        <span
                            style={{
                                display: "inline-block",
                                fontSize: 11,
                                fontWeight: 700,
                                color: savingsColor,
                                background: `${savingsColor}1F`,
                                padding: "1px 8px",
                                borderRadius: 10,
                                lineHeight: "18px",
                                width: "fit-content",
                            }}
                        >
                            FREE
                        </span>
                    )
                )}
            </div>

            <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", flexShrink: 0, gap: 1 }}>
                <span
                    style={{
                        fontSize: 16,
                        fontWeight: 700,
                        color: isFree ? freeTagColor : styles.textColor,
                    }}
                >
                    {isFree ? product.compareAtPrice ? "$0.00" : "FREE" : product.price}
                </span>
                {isFree && product.compareAtPrice && (
                    <span
                        style={{
                            fontSize: 13,
                            color: "#9ca3af",
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
    pricing,
    cartButtonText,
    title,
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
                        fontWeight: 700,
                        color: styles.textColor,
                        margin: "0 0 4px",
                        lineHeight: "1.3",
                    }}
                >
                    {title}
                </h3>
            )}

            {triggerProducts.map((p) => (
                <SleekProductCard key={p.id} product={p} variant="trigger" styles={styles} />
            ))}

            <div
                style={{
                    textAlign: "center",
                    fontSize: 18,
                    fontWeight: 600,
                    color: "#9ca3af",
                    lineHeight: 1,
                    padding: "2px 0",
                }}
            >
                +
            </div>

            {rewardProducts.map((p) => (
                <SleekProductCard key={p.id} product={p} variant="reward" styles={styles} />
            ))}

            <div style={{ borderTop: `1px dashed ${styles.borderColor || "#e5e7eb"}` }} />

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
                            fontSize: 16,
                            fontWeight: 700,
                            color: styles.textColor,
                        }}
                    >
                        Total: {pricing.finalPrice}
                    </span>
                )}

                {cartButtonText && (
                    <button
                        style={{
                            display: "inline-flex",
                            alignItems: "center",
                            justifyContent: "center",
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
                        {cartButtonText}
                    </button>
                )}
            </div>
        </div>
    );
}
