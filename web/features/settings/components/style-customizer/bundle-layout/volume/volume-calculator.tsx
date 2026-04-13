"use client";

import {
    getCardRadius,
    getFontSize,
    getSpacing,
} from "@/features/settings";
import type { VolumeLayoutProps } from "@/features/settings/types/template.types";

export function VolumeCalculator({ tiers, product, highlightColor, styles }: VolumeLayoutProps) {
    const cardRadius = getCardRadius(styles.cornerStyle);
    const fontSize = getFontSize(styles.bodySize);
    const gap = getSpacing(styles.spacing);

    const defaultTier = tiers.find((t) => t.isDefault) ?? tiers[1] ?? tiers[0];
    const initQty = defaultTier?.qty ?? 5;

    return (
        <div
            style={{
                display: "flex",
                flexDirection: "column",
                gap,
                fontSize,
                color: styles.textColor,
            }}
        >
            {product?.image && (
                <div
                    style={{
                        borderRadius: cardRadius,
                        overflow: "hidden",
                        height: 100,
                        backgroundColor: "#f3f4f6",
                    }}
                >
                    <img
                        src={product.image}
                        alt={product.title}
                        style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover" as const,
                        }}
                    />
                </div>
            )}

            <div style={{ fontWeight: 600 }}>{product?.title ?? "Product"}</div>

            <div>
                <div style={{ fontSize: "0.85em", opacity: 0.7, marginBottom: 6 }}>
                    Enter Quantity
                </div>
                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        border: `1px solid ${styles.borderColor}`,
                        borderRadius: cardRadius,
                        overflow: "hidden",
                        width: "fit-content",
                    }}
                >
                    <div
                        style={{
                            width: 34,
                            height: 34,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: "1.2em",
                            borderRight: `1px solid ${styles.borderColor}`,
                            color: styles.textColor,
                            cursor: "default",
                        }}
                    >
                        −
                    </div>
                    <div
                        style={{
                            width: 48,
                            height: 34,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontWeight: 600,
                            color: highlightColor,
                        }}
                    >
                        {initQty}
                    </div>
                    <div
                        style={{
                            width: 34,
                            height: 34,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: "1.2em",
                            borderLeft: `1px solid ${styles.borderColor}`,
                            color: styles.textColor,
                            cursor: "default",
                        }}
                    >
                        +
                    </div>
                </div>
            </div>

            {defaultTier && (
                <div
                    style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 6,
                    }}
                >
                    <div
                        style={{
                            display: "flex",
                            justifyContent: "space-between",
                            padding: "8px 12px",
                            border: `1px solid ${styles.borderColor}`,
                            borderRadius: cardRadius,
                        }}
                    >
                        <span style={{ opacity: 0.7 }}>Total Cost</span>
                        <span
                            style={{
                                fontWeight: 700,
                                color: highlightColor,
                            }}
                        >
                            {defaultTier.price}
                        </span>
                    </div>

                    {defaultTier.savings && (
                        <div
                            style={{
                                display: "flex",
                                justifyContent: "space-between",
                                padding: "8px 12px",
                                border: `1px solid ${styles.savingsColor}30`,
                                borderRadius: cardRadius,
                                backgroundColor: `${styles.savingsColor}08`,
                            }}
                        >
                            <span style={{ opacity: 0.7 }}>You Save</span>
                            <span
                                style={{
                                    fontWeight: 700,
                                    color: styles.savingsColor,
                                }}
                            >
                                {defaultTier.savings}
                            </span>
                        </div>
                    )}
                </div>
            )}

            <div
                style={{
                    display: "flex",
                    flexWrap: "wrap" as const,
                    gap: 6,
                }}
                role="group"
                aria-label="Quantity discount tiers"
            >
                {tiers.map((tier, i) => {
                    const isActive = tier === defaultTier;
                    const label = `${tier.qty}+ (${tier.discount}% off)`;
                    return (
                        <div
                            key={i}
                            style={{
                                padding: "4px 10px",
                                borderRadius: "12px",
                                border: `1px solid ${isActive ? highlightColor : styles.borderColor}`,
                                backgroundColor: isActive
                                    ? `${highlightColor}15`
                                    : "transparent",
                                color: isActive
                                    ? highlightColor
                                    : styles.textColor,
                                fontSize: "11px",
                                fontWeight: isActive ? 600 : 400,
                                cursor: "default",
                                whiteSpace: "nowrap" as const,
                            }}
                        >
                            {label}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
