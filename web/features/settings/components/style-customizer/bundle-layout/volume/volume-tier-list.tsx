"use client";

import {
    getCardRadius,
    getFontSize,
    getSpacing,
} from "@/features/settings";
import type { VolumeLayoutProps } from "@/features/settings/types/template.types";

export function VolumeTierList({ tiers, highlightColor, styles }: VolumeLayoutProps) {
    const cardRadius = getCardRadius(styles.cornerStyle);
    const fontSize = getFontSize(styles.bodySize);
    const gap = getSpacing(styles.spacing);

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
            <div
                style={{
                    border: `1px solid ${styles.borderColor}`,
                    borderRadius: cardRadius,
                    overflow: "hidden",
                }}
            >
                {tiers.map((tier, i) => {
                    const isHighlighted = !!tier.isDefault;
                    const qtyLabel = `Buy ${tier.qty}+`;

                    return (
                        <div
                            key={i}
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "10px",
                                padding: "10px 14px",
                                borderBottom:
                                    i < tiers.length - 1
                                        ? `1px solid ${styles.borderColor}`
                                        : "none",
                                backgroundColor: isHighlighted
                                    ? `${highlightColor}10`
                                    : "transparent",
                            }}
                        >
                            <div
                                style={{
                                    width: 18,
                                    height: 18,
                                    borderRadius: "50%",
                                    border: `2px solid ${isHighlighted ? highlightColor : styles.borderColor}`,
                                    backgroundColor: isHighlighted
                                        ? highlightColor
                                        : "transparent",
                                    flexShrink: 0,
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                }}
                            >
                                {isHighlighted && (
                                    <svg
                                        width="10"
                                        height="10"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="#fff"
                                        strokeWidth="3"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        aria-hidden="true"
                                    >
                                        <polyline points="20 6 9 17 4 12" />
                                    </svg>
                                )}
                            </div>

                            <div style={{ flex: 1 }}>
                                <div
                                    style={{
                                        fontWeight: isHighlighted ? 600 : 400,
                                        color: isHighlighted
                                            ? highlightColor
                                            : styles.textColor,
                                        marginBottom: 2,
                                    }}
                                >
                                    {tier.title || qtyLabel}
                                </div>
                                {tier.savings && (
                                    <div
                                        style={{
                                            fontSize: "0.85em",
                                            color: styles.savingsColor,
                                        }}
                                    >
                                        {tier.savings}
                                    </div>
                                )}
                            </div>

                            <div style={{ textAlign: "right", flexShrink: 0 }}>
                                <div style={{ fontWeight: 600 }}>{tier.price}</div>
                                {tier.comparePrice && (
                                    <div
                                        style={{
                                            fontSize: "0.85em",
                                            textDecoration: "line-through",
                                            opacity: 0.5,
                                        }}
                                    >
                                        {tier.comparePrice}
                                    </div>
                                )}
                            </div>

                            {tier.badge?.text && (
                                <div
                                    style={{
                                        backgroundColor: highlightColor,
                                        color: "#fff",
                                        fontSize: "10px",
                                        fontWeight: 700,
                                        padding: "2px 6px",
                                        borderRadius: "3px",
                                        textTransform: "uppercase" as const,
                                        letterSpacing: "0.4px",
                                        flexShrink: 0,
                                    }}
                                >
                                    {tier.badge.text}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
