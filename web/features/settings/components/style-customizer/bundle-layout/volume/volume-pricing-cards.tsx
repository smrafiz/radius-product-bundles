"use client";

import {
    getButtonRadius,
    getCardRadius,
    getCardBgColor,
    getFontSize,
    getSpacing,
} from "@/features/settings";
import type { VolumeLayoutProps } from "@/features/settings/types/template.types";

export function VolumePricingCards({ tiers, highlightColor, styles }: VolumeLayoutProps) {
    const cardRadius = getCardRadius(styles.cornerStyle);
    const btnRadius = getButtonRadius(styles.cornerStyle);
    const fontSize = getFontSize(styles.bodySize);
    const gap = getSpacing(styles.spacing);
    const cardBg = getCardBgColor(styles);

    return (
        <div
            style={{
                display: "flex",
                flexDirection: "row",
                gap,
                fontSize,
                color: styles.textColor,
                flexWrap: "wrap" as const,
            }}
        >
            {tiers.map((tier, i) => {
                const isHighlighted = !!tier.isDefault;
                const qtyLabel = `Buy ${tier.qty}+`;

                return (
                    <div
                        key={i}
                        style={{
                            flex: "1 1 0",
                            minWidth: 80,
                            position: "relative" as const,
                            backgroundColor: cardBg,
                            border: `${isHighlighted ? "2px" : "1px"} solid ${isHighlighted ? highlightColor : styles.borderColor}`,
                            borderRadius: cardRadius,
                            padding: "12px 10px 10px",
                            display: "flex",
                            flexDirection: "column" as const,
                            alignItems: "center",
                            gap: "6px",
                            boxShadow: isHighlighted
                                ? `0 2px 10px ${highlightColor}28`
                                : "none",
                        }}
                    >
                        {tier.badge?.text && (
                            <div
                                style={{
                                    position: "absolute" as const,
                                    top: -10,
                                    left: "50%",
                                    transform: "translateX(-50%)",
                                    backgroundColor: highlightColor,
                                    color: "#fff",
                                    fontSize: "10px",
                                    fontWeight: 700,
                                    padding: "2px 8px",
                                    borderRadius: "10px",
                                    textTransform: "uppercase" as const,
                                    letterSpacing: "0.4px",
                                    whiteSpace: "nowrap" as const,
                                }}
                            >
                                {tier.badge.text}
                            </div>
                        )}

                        <div
                            style={{
                                fontWeight: 600,
                                fontSize: "1em",
                                color: isHighlighted
                                    ? highlightColor
                                    : styles.textColor,
                                textAlign: "center" as const,
                            }}
                        >
                            {tier.title || qtyLabel}
                        </div>

                        <div
                            style={{
                                fontSize: "0.85em",
                                opacity: 0.65,
                                textAlign: "center" as const,
                            }}
                        >
                            {tier.subtitle || qtyLabel}
                        </div>

                        <div
                            style={{
                                fontWeight: 700,
                                fontSize: "1.05em",
                                color: styles.textColor,
                            }}
                        >
                            {tier.price}
                        </div>

                        {tier.savings && (
                            <div
                                style={{
                                    backgroundColor: `${styles.savingsColor}18`,
                                    color: styles.savingsColor,
                                    fontSize: "10px",
                                    fontWeight: 600,
                                    padding: "2px 8px",
                                    borderRadius: "10px",
                                    textTransform: "uppercase" as const,
                                }}
                            >
                                {tier.savings}
                            </div>
                        )}

                        <div
                            style={{
                                marginTop: 2,
                                backgroundColor: isHighlighted
                                    ? highlightColor
                                    : styles.buttonBgColor || styles.primaryColor,
                                color: "#fff",
                                fontSize: "11px",
                                fontWeight: 600,
                                padding: "5px 10px",
                                borderRadius: btnRadius,
                                width: "100%",
                                textAlign: "center" as const,
                                cursor: "default",
                            }}
                        >
                            Select
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
