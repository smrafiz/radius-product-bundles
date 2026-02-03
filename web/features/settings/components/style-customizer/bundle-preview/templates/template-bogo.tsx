"use client";

import type { BundleTemplateProps } from "@/features/settings/types/template.types";
import {
    DEFAULT_LABELS,
    getCardRadius,
    getFontSize,
    getImageSize,
    getSpacing,
    getCardBgColor,
    useCustomizerStore,
} from "@/features/settings";

function ProductCard({
    label,
    isFree,
    freeTagColor,
}: {
    label: string;
    isFree?: boolean;
    freeTagColor?: string;
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
            {isFree && (
                <div
                    style={{
                        position: "absolute",
                        top: "6px",
                        right: "6px",
                        backgroundColor: freeTagColor || "#16a34a",
                        color: "#fff",
                        fontSize: "10px",
                        fontWeight: 700,
                        padding: "2px 8px",
                        borderRadius: "4px",
                        textTransform: "uppercase",
                        letterSpacing: "0.5px",
                    }}
                >
                    FREE
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
                    alt={label}
                    style={{
                        width: "100%",
                        height: "100%",
                        objectFit: styles.imageFit,
                    }}
                />
            </div>

            <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 500, marginBottom: "4px" }}>
                    {label}
                </div>
                <div style={{ opacity: 0.7, fontSize: "0.9em" }}>
                    {DEFAULT_LABELS.quantityLabel} 1
                </div>
            </div>

            <div style={{ textAlign: "right" }}>
                <div style={{ fontWeight: 600 }}>
                    {isFree ? "$0.00" : "$300.33"}
                </div>
                {!isFree && (
                    <div
                        style={{
                            textDecoration: "line-through",
                            opacity: 0.6,
                            fontSize: "0.9em",
                        }}
                    >
                        $600.00
                    </div>
                )}
            </div>
        </div>
    );
}

export function TemplateBogo({ activeLayout }: BundleTemplateProps) {
    const { styles } = useCustomizerStore();
    const gap = getSpacing(styles.spacing);

    return (
        <div
            style={{
                display: "flex",
                flexDirection: "column",
                gap,
            }}
        >
            <div
                style={{
                    fontSize: "13px",
                    fontWeight: 600,
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                    color: styles.textColor,
                    opacity: 0.7,
                    paddingBottom: "4px",
                }}
            >
                Buy These
            </div>

            <div
                style={{
                    display: activeLayout === "GRID" ? "grid" : "flex",
                    gridTemplateColumns:
                        activeLayout === "GRID"
                            ? `repeat(${styles.gridColumns ?? 2}, 1fr)`
                            : undefined,
                    flexDirection:
                        activeLayout !== "GRID" ? "column" : undefined,
                    gap,
                }}
            >
                <ProductCard label="Trigger Product A" />
                <ProductCard label="Trigger Product B" />
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
                        color: styles.primaryColor,
                        whiteSpace: "nowrap",
                    }}
                >
                    +
                </div>
                <div
                    style={{
                        flex: 1,
                        height: "1px",
                        backgroundColor: styles.borderColor,
                    }}
                />
            </div>

            <div
                style={{
                    fontSize: "13px",
                    fontWeight: 600,
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                    color: styles.bogoFreeTagColor,
                    paddingBottom: "4px",
                }}
            >
                Get These Free
            </div>

            <ProductCard
                label="Reward Product"
                isFree
                freeTagColor={styles.bogoFreeTagColor}
            />
        </div>
    );
}
