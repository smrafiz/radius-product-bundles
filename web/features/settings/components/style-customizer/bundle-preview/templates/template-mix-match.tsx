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

const GROUPS = [
    { name: "Choose a Top", min: 1, max: 2, count: 3 },
    { name: "Choose a Bottom", min: 1, max: 1, count: 2 },
] as const;

function SelectableProductCard({
    selected,
    selectionStyle,
    accentColor,
}: {
    selected: boolean;
    selectionStyle: "checkbox" | "radio" | "highlight";
    accentColor: string;
}) {
    const { styles } = useCustomizerStore();
    const imageSizePx = getImageSize(styles.imageSize);
    const cardRadius = getCardRadius(styles.cornerStyle);
    const fontSize = getFontSize(styles.bodySize);
    const gap = getSpacing(styles.spacing);
    const cardBackground = getCardBgColor(styles);

    return (
        <div
            style={{
                position: "relative",
                display: "flex",
                alignItems: "center",
                gap,
                backgroundColor:
                    selectionStyle === "highlight" && selected
                        ? `${accentColor}08`
                        : cardBackground,
                borderRadius: cardRadius,
                fontSize,
                color: styles.textColor,
                border:
                    selectionStyle === "highlight" && selected
                        ? `2px solid ${accentColor}`
                        : styles.productCardBorder
                          ? `1px solid ${styles.borderColor}`
                          : "1px solid transparent",
                padding: gap,
                cursor: "pointer",
                transition: "all 0.15s",
            }}
        >
            {selectionStyle !== "highlight" && (
                <div
                    style={{
                        width: "18px",
                        height: "18px",
                        borderRadius:
                            selectionStyle === "radio" ? "50%" : "4px",
                        border: `2px solid ${selected ? accentColor : styles.borderColor}`,
                        backgroundColor: selected ? accentColor : "transparent",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                        transition: "all 0.15s",
                    }}
                >
                    {selected && (
                        <svg
                            width="10"
                            height="10"
                            viewBox="0 0 10 10"
                            fill="none"
                        >
                            <path
                                d="M2 5L4 7L8 3"
                                stroke="#fff"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />
                        </svg>
                    )}
                </div>
            )}

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
                <div style={{ fontWeight: 500, marginBottom: "2px" }}>
                    Product option
                </div>
                <div style={{ fontWeight: 600, fontSize: "0.95em" }}>
                    $25.00
                </div>
            </div>
        </div>
    );
}

export function TemplateMixMatch({ activeLayout }: BundleTemplateProps) {
    const { styles } = useCustomizerStore();
    const gap = getSpacing(styles.spacing);
    const groupHeaderColor =
        styles.mixMatchGroupHeaderColor || styles.primaryColor;
    const selectionStyle = styles.mixMatchSelectionStyle || "checkbox";

    return (
        <div style={{ display: "flex", flexDirection: "column", gap }}>
            {GROUPS.map((group, gi) => (
                <div
                    key={gi}
                    style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "8px",
                    }}
                >
                    <div
                        style={{
                            display: "flex",
                            alignItems: "baseline",
                            justifyContent: "space-between",
                        }}
                    >
                        <div
                            style={{
                                fontSize: "14px",
                                fontWeight: 600,
                                color: groupHeaderColor,
                            }}
                        >
                            {group.name}
                        </div>
                        <div
                            style={{
                                fontSize: "12px",
                                color: styles.textColor,
                                opacity: 0.6,
                            }}
                        >
                            Pick {group.min}
                            {group.max > group.min
                                ? `–${group.max}`
                                : ""}
                        </div>
                    </div>

                    <div
                        style={{
                            display:
                                activeLayout === "GRID" ? "grid" : "flex",
                            gridTemplateColumns:
                                activeLayout === "GRID"
                                    ? `repeat(${styles.gridColumns ?? 3}, 1fr)`
                                    : undefined,
                            flexDirection:
                                activeLayout !== "GRID"
                                    ? "column"
                                    : undefined,
                            gap: "8px",
                        }}
                    >
                        {Array.from({ length: group.count }).map((_, pi) => (
                            <SelectableProductCard
                                key={pi}
                                selected={pi < group.min}
                                selectionStyle={selectionStyle}
                                accentColor={groupHeaderColor}
                            />
                        ))}
                    </div>

                    {gi < GROUPS.length - 1 && (
                        <div
                            style={{
                                height: "1px",
                                backgroundColor: styles.borderColor,
                                margin: "4px 0",
                            }}
                        />
                    )}
                </div>
            ))}
        </div>
    );
}
