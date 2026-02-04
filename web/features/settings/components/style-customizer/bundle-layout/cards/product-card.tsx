"use client";

import type { ProductCardProps } from "@/features/settings/types/template.types";
import {
    DEFAULT_LABELS,
    getCardRadius,
    getFontSize,
    getImageSize,
    getSpacing,
    getCardBgColor,
    useCustomizerStore,
} from "@/features/settings";

export function ProductCard({
    label,
    price,
    comparePrice,
    badge,
    variant = "horizontal",
    showCardStyle = true,
}: ProductCardProps) {
    const { styles } = useCustomizerStore();
    const imageSizePx = getImageSize(styles.imageSize);
    const cardRadius = getCardRadius(styles.cornerStyle);
    const fontSize = getFontSize(styles.bodySize);
    const gap = getSpacing(styles.spacing);
    const cardBackground = getCardBgColor(styles);

    const cardStyle = showCardStyle
        ? {
              backgroundColor: cardBackground,
              borderRadius: cardRadius,
              border: styles.productCardBorder
                  ? `1px solid ${styles.borderColor}`
                  : "none",
              boxShadow: styles.productCardShadow
                  ? "0 2px 8px rgba(0, 0, 0, 0.08) hover: 0 2px 12px rgba(0, 0, 0, 0.12)"
                  : "none",
              padding: gap,
          }
        : {};

    const badgeEl = badge && (
        <div
            style={{
                position: "absolute",
                top: "6px",
                right: "6px",
                backgroundColor: badge.color,
                color: "#fff",
                fontSize: "10px",
                fontWeight: 700,
                padding: "2px 8px",
                borderRadius: "4px",
                textTransform: "uppercase",
                letterSpacing: "0.5px",
            }}
        >
            {badge.text}
        </div>
    );

    const imageEl = (
        <img
            src="/assets/product-image-placeholder.webp"
            alt={label}
            style={{
                width: "100%",
                height: "100%",
                objectFit: styles.imageFit,
            }}
        />
    );

    if (variant === "vertical") {
        return (
            <div
                style={{
                    ...cardStyle,
                    position: badge ? "relative" : undefined,
                    fontSize,
                    color: styles.textColor,
                }}
            >
                {badgeEl}

                <div
                    style={{
                        height: imageSizePx,
                        borderRadius: cardRadius,
                        marginBottom: "8px",
                        backgroundColor: "#f3f4f6",
                        overflow: "hidden",
                    }}
                >
                    {imageEl}
                </div>

                <div style={{ fontWeight: 500, marginBottom: "8px" }}>
                    {label}
                </div>

                <div style={{ marginBottom: "8px" }}>
                    <span
                        style={{ fontWeight: 600, marginRight: "6px" }}
                    >
                        {price}
                    </span>
                    {comparePrice && (
                        <span
                            style={{
                                textDecoration: "line-through",
                                opacity: 0.6,
                                fontSize: "0.9em",
                            }}
                        >
                            {comparePrice}
                        </span>
                    )}
                </div>

                <div style={{ opacity: 0.7, fontSize: "0.9em" }}>
                    {DEFAULT_LABELS.quantityLabel} 1
                </div>
            </div>
        );
    }

    return (
        <div
            style={{
                ...cardStyle,
                position: badge ? "relative" : undefined,
                display: "flex",
                alignItems: "center",
                gap,
                fontSize,
                color: styles.textColor,
            }}
        >
            {badgeEl}

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
                {imageEl}
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
                <div style={{ fontWeight: 600 }}>{price}</div>
                {comparePrice && (
                    <div
                        style={{
                            textDecoration: "line-through",
                            opacity: 0.6,
                            fontSize: "0.9em",
                        }}
                    >
                        {comparePrice}
                    </div>
                )}
            </div>
        </div>
    );
}
