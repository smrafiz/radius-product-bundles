"use client";

import {
    getCardRadius,
    getFontSize,
    getImageSize,
    getSpacing,
    getCardBgColor,
    useCustomizerStore,
    SelectableProductCardProps,
    CheckIndicator,
} from "@/features/settings";

export function SelectableProductCard({
    selected,
    selectionStyle,
    accentColor,
}: SelectableProductCardProps) {
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
                <CheckIndicator
                    checked={selected}
                    color={accentColor}
                    borderColor={styles.borderColor}
                    variant={selectionStyle}
                />
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
