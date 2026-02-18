"use client";

import {
    FbtProductCardProps,
    getCardBgColor,
    getCardRadius,
    getFontSize,
    getImageSize,
    getSpacing,
    useCustomizerStore,
} from "@/features/settings";
import { CheckIndicator } from "./check-indicator";

export function FbtProductCard({
    name,
    price,
    checked,
    checkboxColor,
}: FbtProductCardProps) {
    const { styles } = useCustomizerStore();
    const imageSizePx = getImageSize(styles.imageSize);
    const cardRadius = getCardRadius(styles.cornerStyle);
    const fontSize = getFontSize(styles.bodySize);
    const gap = getSpacing(styles.spacing);
    const cardBackground = getCardBgColor(styles);

    return (
        <div
            style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "8px",
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
                opacity: checked ? 1 : 0.5,
                transition: "opacity 0.15s",
                flex: "1 1 0",
                minWidth: 0,
            }}
        >
            <div style={{ alignSelf: "flex-start" }}>
                <CheckIndicator
                    checked={checked}
                    color={checkboxColor}
                    borderColor={styles.borderColor}
                    variant="checkbox"
                />
            </div>

            <div
                style={{
                    width: imageSizePx,
                    height: imageSizePx,
                    borderRadius: cardRadius,
                    backgroundColor: "#f3f4f6",
                    overflow: "hidden",
                    flexShrink: 0,
                }}
            >
                <img
                    src="/assets/product-image-placeholder.webp"
                    alt={name}
                    style={{
                        width: "100%",
                        height: "100%",
                        objectFit: styles.imageFit,
                    }}
                />
            </div>

            <div style={{ textAlign: "center", width: "100%" }}>
                <div
                    style={{
                        fontWeight: 500,
                        marginBottom: "2px",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                    }}
                >
                    {name}
                </div>
                <div style={{ fontWeight: 600 }}>{price}</div>
            </div>
        </div>
    );
}
