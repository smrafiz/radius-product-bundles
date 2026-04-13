"use client";

import {
    getCardRadius,
    getFontSize,
    getSpacing,
} from "@/features/settings";
import type { VolumeLayoutProps } from "@/features/settings/types/template.types";

export function VolumeSlider({ tiers, product, highlightColor, styles }: VolumeLayoutProps) {
    const cardRadius = getCardRadius(styles.cornerStyle);
    const fontSize = getFontSize(styles.bodySize);
    const gap = getSpacing(styles.spacing);

    const defaultTier = tiers.find((t) => t.isDefault) ?? tiers[1] ?? tiers[0];
    const firstTier = tiers[0];

    // Build slider max from last tier qty × 1.5, capped at 100
    const lastQty = tiers[tiers.length - 1]?.qty ?? 10;
    const sliderMax = Math.min(100, Math.round(lastQty * 1.5));
    const initQty = firstTier?.qty ?? 2;
    const fillPct = sliderMax > 1
        ? Math.round(((initQty - 1) / (sliderMax - 1)) * 100)
        : 0;

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
                        position: "relative" as const,
                        borderRadius: cardRadius,
                        overflow: "hidden",
                        height: 120,
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
                    {defaultTier?.savings && (
                        <div
                            style={{
                                position: "absolute" as const,
                                top: 8,
                                right: 8,
                                backgroundColor: styles.savingsColor,
                                color: "#fff",
                                fontSize: "11px",
                                fontWeight: 700,
                                padding: "3px 8px",
                                borderRadius: "10px",
                            }}
                        >
                            {defaultTier.savings}
                        </div>
                    )}
                </div>
            )}

            <div style={{ fontWeight: 600, fontSize: "1em" }}>
                {product?.title ?? "Product"}
            </div>

            {defaultTier && (
                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        padding: "10px 14px",
                        border: `1px solid ${styles.borderColor}`,
                        borderRadius: cardRadius,
                        backgroundColor: `${highlightColor}08`,
                    }}
                >
                    <div>
                        <div style={{ fontWeight: 700, fontSize: "1.1em" }}>
                            {defaultTier.price}
                        </div>
                        <div style={{ fontSize: "0.85em", opacity: 0.65 }}>
                            per unit
                        </div>
                    </div>
                    {defaultTier.comparePrice && (
                        <div
                            style={{
                                textDecoration: "line-through",
                                opacity: 0.5,
                                fontSize: "0.9em",
                            }}
                        >
                            {defaultTier.comparePrice}
                        </div>
                    )}
                    {defaultTier.savings && (
                        <div
                            style={{
                                color: styles.savingsColor,
                                fontWeight: 600,
                                fontSize: "0.9em",
                            }}
                        >
                            -{defaultTier.savings}
                        </div>
                    )}
                </div>
            )}

            <div>
                <div
                    style={{
                        display: "flex",
                        justifyContent: "space-between",
                        marginBottom: 6,
                        fontSize: "0.9em",
                    }}
                >
                    <span>Select Quantity</span>
                    <span style={{ color: highlightColor, fontWeight: 600 }}>
                        {initQty} units
                    </span>
                </div>
                <div
                    style={{
                        position: "relative" as const,
                        height: 6,
                        borderRadius: 3,
                        backgroundColor: `${styles.borderColor}`,
                        overflow: "hidden",
                    }}
                >
                    <div
                        style={{
                            position: "absolute" as const,
                            left: 0,
                            top: 0,
                            height: "100%",
                            width: `${fillPct}%`,
                            backgroundColor: highlightColor,
                            borderRadius: 3,
                        }}
                    />
                </div>
                <div
                    style={{
                        position: "relative" as const,
                        height: 12,
                        marginTop: 2,
                    }}
                >
                    {tiers.map((tier, i) => {
                        const pct =
                            sliderMax > 1
                                ? ((tier.qty - 1) / (sliderMax - 1)) * 100
                                : 0;
                        return (
                            <span
                                key={i}
                                style={{
                                    position: "absolute" as const,
                                    left: `${pct}%`,
                                    transform: "translateX(-50%)",
                                    width: 8,
                                    height: 8,
                                    borderRadius: "50%",
                                    backgroundColor: styles.borderColor,
                                    display: "block",
                                }}
                            />
                        );
                    })}
                </div>
            </div>

            {tiers[1] && (
                <div
                    style={{
                        border: `1px solid ${styles.borderColor}`,
                        borderRadius: cardRadius,
                        padding: "8px 12px",
                    }}
                >
                    <div
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 6,
                            fontSize: "0.85em",
                            marginBottom: 4,
                            color: styles.textColor,
                        }}
                    >
                        <svg
                            width="12"
                            height="12"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            aria-hidden="true"
                        >
                            <path d="M20 12v6a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-6" />
                            <polyline points="16 6 12 2 8 6" />
                            <line x1="12" y1="2" x2="12" y2="15" />
                        </svg>
                        <span>
                            Add {tiers[1].qty - initQty} more to save{" "}
                            {tiers[1].savings ?? `${tiers[1].discount}% off`}!
                        </span>
                    </div>
                    <div
                        style={{
                            height: 4,
                            borderRadius: 2,
                            backgroundColor: styles.borderColor,
                            overflow: "hidden",
                        }}
                    >
                        <div
                            style={{
                                height: "100%",
                                width: `${Math.round((initQty / tiers[1].qty) * 100)}%`,
                                backgroundColor: styles.savingsColor,
                                borderRadius: 2,
                            }}
                        />
                    </div>
                </div>
            )}
        </div>
    );
}
