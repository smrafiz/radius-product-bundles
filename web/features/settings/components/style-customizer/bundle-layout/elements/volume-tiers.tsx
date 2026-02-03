"use client";

import {
    getCardRadius,
    useCustomizerStore,
    VolumeTiersProps,
} from "@/features/settings";

export function VolumeTiers({
    tiers,
    highlightColor,
}: VolumeTiersProps) {
    const { styles } = useCustomizerStore();
    const cardRadius = getCardRadius(styles.cornerStyle);
    const tierStyle = styles.volumeTierStyle || "table";

    if (tierStyle === "cards") {
        return (
            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: `repeat(${tiers.length}, 1fr)`,
                    gap: "8px",
                }}
            >
                {tiers.map((tier, i) => (
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
                        <div style={{ fontSize: "13px", fontWeight: 500 }}>
                            {tier.price} ea
                        </div>
                    </div>
                ))}
            </div>
        );
    }

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
                    <div style={{ fontWeight: 500, fontSize: "13px" }}>
                        {tier.price} each
                    </div>
                </div>
            ))}
        </div>
    );
}
