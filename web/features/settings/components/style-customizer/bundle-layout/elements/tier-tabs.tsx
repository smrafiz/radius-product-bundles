"use client";

import { TierTabsProps, useCustomizerStore } from "@/features/settings";

export function TierTabs({ tiers, activeIndex }: TierTabsProps) {
    const { styles } = useCustomizerStore();

    return (
        <div
            style={{
                display: "flex",
                borderBottom: `2px solid ${styles.borderColor}`,
            }}
        >
            {tiers.map((tier, i) => (
                <button
                    key={i}
                    style={{
                        flex: 1,
                        padding: "10px 12px",
                        fontSize: "13px",
                        fontWeight: i === activeIndex ? 600 : 400,
                        color:
                            i === activeIndex
                                ? styles.primaryColor
                                : styles.textColor,
                        backgroundColor: "transparent",
                        border: "none",
                        borderBottomWidth: "2px",
                        borderBottomStyle: "solid",
                        borderBottomColor:
                            i === activeIndex
                                ? styles.primaryColor
                                : "transparent",
                        cursor: "pointer",
                        transition: "all 0.2s",
                    }}
                >
                    {tier.label}
                </button>
            ))}
        </div>
    );
}
