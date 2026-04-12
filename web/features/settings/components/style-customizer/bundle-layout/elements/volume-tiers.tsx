"use client";

import {
    getCardRadius,
    useCustomizerStore,
    VolumeTiersProps,
} from "@/features/settings";

export function VolumeTiers({ tiers, highlightColor }: VolumeTiersProps) {
    const { styles } = useCustomizerStore();
    const cardRadius = getCardRadius(styles.cornerStyle);

    return (
        <div
            style={{
                border: `1px solid ${styles.borderColor}`,
                borderRadius: cardRadius,
                overflow: "hidden",
            }}
        >
            {tiers.map((tier, i) => (
                <div
                    key={i}
                    style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        padding: "10px 14px",
                        borderBottom:
                            i < tiers.length - 1
                                ? `1px solid ${styles.borderColor}`
                                : "none",
                        backgroundColor:
                            i === 1 ? `${highlightColor}08` : "transparent",
                    }}
                >
                    <div
                        style={{
                            fontWeight: i === 1 ? 600 : 400,
                            color: i === 1 ? highlightColor : styles.textColor,
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
                    <div style={{ fontWeight: 500, fontSize: "13px" }}>
                        {tier.price} each
                    </div>
                </div>
            ))}
        </div>
    );
}
