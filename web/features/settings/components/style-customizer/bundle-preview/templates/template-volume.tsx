"use client";

import type { BundleTemplateProps } from "@/features/settings/types/template.types";
import {
    getCardRadius,
    getFontSize,
    getImageSize,
    getSpacing,
    getCardBgColor,
    useCustomizerStore,
} from "@/features/settings";

const VOLUME_TIERS = [
    { qty: 2, discount: 10, price: "$27.00" },
    { qty: 5, discount: 20, price: "$24.00" },
    { qty: 10, discount: 30, price: "$21.00" },
] as const;

export function TemplateVolume({ activeLayout }: BundleTemplateProps) {
    const { styles } = useCustomizerStore();
    const gap = getSpacing(styles.spacing);
    const cardRadius = getCardRadius(styles.cornerStyle);
    const imageSizePx = getImageSize(styles.imageSize);
    const fontSize = getFontSize(styles.bodySize);
    const cardBackground = getCardBgColor(styles);
    const highlightColor =
        styles.volumeTierHighlightColor || styles.primaryColor;
    const tierStyle = styles.volumeTierStyle || "table";

    return (
        <div style={{ display: "flex", flexDirection: "column", gap }}>
            <div
                style={{
                    display: "flex",
                    alignItems: "center",
                    gap,
                    backgroundColor: cardBackground,
                    borderRadius: cardRadius,
                    fontSize,
                    color: styles.textColor,
                    border: styles.productCardBorder
                        ? `1px solid ${styles.borderColor}`
                        : "none",
                    boxShadow: styles.productCardShadow
                        ? "0 4px 12px rgba(0,0,0,0.08)"
                        : "none",
                    padding: gap,
                }}
            >
                <div
                    style={{
                        width: imageSizePx,
                        height: imageSizePx,
                        borderRadius: cardRadius,
                        flexShrink: 0,
                        backgroundColor: "#f3f4f6",
                        overflow: "hidden",
                    }}
                >
                    <img
                        src="/assets/product-image-placeholder.webp"
                        alt="Product"
                        style={{
                            width: "100%",
                            height: "100%",
                            objectFit: styles.imageFit,
                        }}
                    />
                </div>
                <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 500, marginBottom: "4px" }}>
                        Volume Product
                    </div>
                    <div style={{ fontWeight: 600 }}>$30.00 each</div>
                </div>
            </div>

            <div
                style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    padding: "4px 0",
                }}
            >
                <div
                    style={{
                        flex: 1,
                        height: "1px",
                        backgroundColor: styles.borderColor,
                    }}
                />
                <div
                    style={{
                        fontSize: "12px",
                        fontWeight: 600,
                        color: styles.textColor,
                        opacity: 0.6,
                        whiteSpace: "nowrap",
                    }}
                >
                    Quantity Tiers
                </div>
                <div
                    style={{
                        flex: 1,
                        height: "1px",
                        backgroundColor: styles.borderColor,
                    }}
                />
            </div>

            {tierStyle === "cards" ? (
                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(3, 1fr)",
                        gap: "8px",
                    }}
                >
                    {VOLUME_TIERS.map((tier, i) => (
                        <div
                            key={i}
                            style={{
                                border: `2px solid ${i === 1 ? highlightColor : styles.borderColor}`,
                                borderRadius: cardRadius,
                                padding: "12px 8px",
                                textAlign: "center",
                                backgroundColor:
                                    i === 1
                                        ? `${highlightColor}08`
                                        : "transparent",
                                position: "relative",
                            }}
                        >
                            {i === 1 && (
                                <div
                                    style={{
                                        position: "absolute",
                                        top: "-8px",
                                        left: "50%",
                                        transform: "translateX(-50%)",
                                        backgroundColor: highlightColor,
                                        color: "#fff",
                                        fontSize: "9px",
                                        fontWeight: 700,
                                        padding: "1px 8px",
                                        borderRadius: "3px",
                                        textTransform: "uppercase",
                                        whiteSpace: "nowrap",
                                    }}
                                >
                                    Popular
                                </div>
                            )}
                            <div
                                style={{
                                    fontSize: "18px",
                                    fontWeight: 700,
                                    color:
                                        i === 1
                                            ? highlightColor
                                            : styles.textColor,
                                }}
                            >
                                {tier.qty}+
                            </div>
                            <div
                                style={{
                                    fontSize: "12px",
                                    color: styles.savingsColor,
                                    fontWeight: 600,
                                    margin: "4px 0",
                                }}
                            >
                                {tier.discount}% off
                            </div>
                            <div
                                style={{
                                    fontSize: "13px",
                                    fontWeight: 500,
                                }}
                            >
                                {tier.price} ea
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div
                    style={{
                        border: `1px solid ${styles.borderColor}`,
                        borderRadius: cardRadius,
                        overflow: "hidden",
                    }}
                >
                    {VOLUME_TIERS.map((tier, i) => (
                        <div
                            key={i}
                            style={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                                padding: "10px 14px",
                                borderBottom:
                                    i < VOLUME_TIERS.length - 1
                                        ? `1px solid ${styles.borderColor}`
                                        : "none",
                                backgroundColor:
                                    i === 1
                                        ? `${highlightColor}08`
                                        : "transparent",
                            }}
                        >
                            <div
                                style={{
                                    fontWeight: i === 1 ? 600 : 400,
                                    color:
                                        i === 1
                                            ? highlightColor
                                            : styles.textColor,
                                }}
                            >
                                Buy {tier.qty}+
                            </div>
                            <div
                                style={{
                                    color: styles.savingsColor,
                                    fontWeight: 600,
                                    fontSize: "13px",
                                }}
                            >
                                {tier.discount}% off
                            </div>
                            <div
                                style={{
                                    fontWeight: 500,
                                    fontSize: "13px",
                                }}
                            >
                                {tier.price} each
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
