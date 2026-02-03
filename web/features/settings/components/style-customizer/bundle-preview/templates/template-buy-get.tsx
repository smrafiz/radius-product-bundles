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

const TIERS = [
    { buy: 2, get: 1, label: "Buy 2, Get 1 Free" },
    { buy: 3, get: 2, label: "Buy 3, Get 2 Free" },
] as const;

function MiniProductCard({ isFree }: { isFree?: boolean }) {
    const { styles } = useCustomizerStore();
    const imageSizePx = getImageSize(styles.imageSize);
    const cardRadius = getCardRadius(styles.cornerStyle);
    const fontSize = getFontSize(styles.bodySize);
    const cardBackground = getCardBgColor(styles);

    return (
        <div
            style={{
                position: "relative",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                backgroundColor: cardBackground,
                borderRadius: cardRadius,
                fontSize: `${Math.max(parseInt(fontSize) - 1, 12)}px`,
                color: styles.textColor,
                border: styles.productCardBorder
                    ? `1px solid ${styles.borderColor}`
                    : "none",
                padding: "8px",
            }}
        >
            {isFree && (
                <div
                    style={{
                        position: "absolute",
                        top: "4px",
                        right: "4px",
                        backgroundColor: styles.bogoFreeTagColor || "#16a34a",
                        color: "#fff",
                        fontSize: "9px",
                        fontWeight: 700,
                        padding: "1px 6px",
                        borderRadius: "3px",
                        textTransform: "uppercase",
                    }}
                >
                    FREE
                </div>
            )}
            <div
                style={{
                    width: `${Math.max(parseInt(String(imageSizePx)) - 20, 40)}px`,
                    height: `${Math.max(parseInt(String(imageSizePx)) - 20, 40)}px`,
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
                <div style={{ fontWeight: 500 }}>Product</div>
                <div style={{ opacity: 0.7, fontSize: "0.9em" }}>
                    {isFree ? "$0.00" : "$30.00"}
                </div>
            </div>
        </div>
    );
}

export function TemplateBuyGet({ activeLayout }: BundleTemplateProps) {
    const { styles } = useCustomizerStore();
    const gap = getSpacing(styles.spacing);
    const cardRadius = getCardRadius(styles.cornerStyle);
    const tierStyle = styles.buyGetTierStyle;

    if (tierStyle === "tabs") {
        return (
            <div style={{ display: "flex", flexDirection: "column", gap }}>
                <div
                    style={{
                        display: "flex",
                        borderBottom: `2px solid ${styles.borderColor}`,
                    }}
                >
                    {TIERS.map((tier, i) => (
                        <button
                            key={i}
                            style={{
                                flex: 1,
                                padding: "10px 12px",
                                fontSize: "13px",
                                fontWeight: i === 0 ? 600 : 400,
                                color:
                                    i === 0
                                        ? styles.primaryColor
                                        : styles.textColor,
                                borderBottom:
                                    i === 0
                                        ? `2px solid ${styles.primaryColor}`
                                        : "2px solid transparent",
                                backgroundColor: "transparent",
                                border: "none",
                                borderBottomWidth: "2px",
                                borderBottomStyle: "solid",
                                borderBottomColor:
                                    i === 0
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
                <div
                    style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "6px",
                    }}
                >
                    {Array.from({ length: TIERS[0].buy }).map((_, j) => (
                        <MiniProductCard key={`buy-${j}`} />
                    ))}
                    {Array.from({ length: TIERS[0].get }).map((_, j) => (
                        <MiniProductCard key={`get-${j}`} isFree />
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div style={{ display: "flex", flexDirection: "column", gap }}>
            {TIERS.map((tier, i) => (
                <div
                    key={i}
                    style={{
                        border:
                            tierStyle === "cards"
                                ? `1px solid ${styles.borderColor}`
                                : "none",
                        borderRadius:
                            tierStyle === "cards" ? cardRadius : undefined,
                        padding: tierStyle === "cards" ? "12px" : "0",
                        borderBottom:
                            tierStyle === "list"
                                ? `1px solid ${styles.borderColor}`
                                : undefined,
                        paddingBottom: tierStyle === "list" ? gap : undefined,
                    }}
                >
                    <div
                        style={{
                            fontSize: "14px",
                            fontWeight: 600,
                            color: styles.primaryColor,
                            marginBottom: "8px",
                        }}
                    >
                        {tier.label}
                    </div>

                    <div
                        style={{
                            display:
                                activeLayout === "GRID" ? "grid" : "flex",
                            gridTemplateColumns:
                                activeLayout === "GRID"
                                    ? "repeat(auto-fill, minmax(120px, 1fr))"
                                    : undefined,
                            flexDirection:
                                activeLayout !== "GRID"
                                    ? "column"
                                    : undefined,
                            gap: "6px",
                        }}
                    >
                        {Array.from({ length: tier.buy }).map((_, j) => (
                            <MiniProductCard key={`buy-${j}`} />
                        ))}
                        {Array.from({ length: tier.get }).map((_, j) => (
                            <MiniProductCard key={`get-${j}`} isFree />
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
}
