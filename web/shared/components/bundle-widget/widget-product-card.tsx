"use client";

import {
    getCardBgColor,
    getCardRadius,
    getFontSize,
    getImageSize,
    getSpacing,
} from "@/features/settings";
import { WidgetProductCardProps } from "@/shared";
import { DEFAULT_LABELS } from "@/features/settings/constants/defaults.constants";

export function WidgetProductCard({
    product,
    styles,
    displayOptions,
    variant = "horizontal",
    showCardStyle = true,
}: WidgetProductCardProps) {
    const imageSizePx = getImageSize(styles.imageSize);
    const cardRadius = getCardRadius(styles.cornerStyle);
    const fontSize = getFontSize(styles.bodySize);
    const gap = getSpacing(styles.spacing);
    const cardBackground = getCardBgColor(styles);

    const truncatedTitle =
        product.title.length > 40
            ? `${product.title.slice(0, 40)}...`
            : product.title;

    const cardStyle: React.CSSProperties = showCardStyle
        ? {
              backgroundColor: cardBackground,
              borderRadius: cardRadius,
              border: styles.productCardBorder
                  ? `1px solid ${styles.borderColor}`
                  : "none",
              boxShadow: styles.productCardShadow
                  ? "0 2px 8px rgba(0, 0, 0, 0.08)"
                  : "none",
              padding: gap,
          }
        : {};

    const badgeEl = product.badge && (
        <div
            style={{
                position: "absolute",
                top: "6px",
                right: "6px",
                backgroundColor: product.badge.color,
                color: "#fff",
                fontSize: "10px",
                fontWeight: 700,
                padding: "2px 8px",
                borderRadius: "4px",
                textTransform: "uppercase",
                letterSpacing: "0.5px",
            }}
        >
            {product.badge.text}
        </div>
    );

    const imageEl = displayOptions.showImages && (
        <img
            src={product.image || "/assets/product-image-placeholder.webp"}
            alt={product.title}
            loading="lazy"
            style={{
                width: "100%",
                height: "100%",
                objectFit: styles.imageFit,
            }}
        />
    );

    const titleEl =
        displayOptions.enableHyperLink && product.url ? (
            <a href={product.url} className="hover:underline">
                {truncatedTitle}
            </a>
        ) : (
            <span>{truncatedTitle}</span>
        );

    const priceEl = displayOptions.showPrices && (
        <div
            className="radius-bundle__product-price"
            style={{
                textAlign: styles.imagePosition === "top"
                    ? "center"
                    : undefined
            }}
        >
            <span className="radius-bundle__product-price-current" style={{ fontWeight: 600 }}>
                {product.price}
            </span>
            {displayOptions.showComparePrices && product.compareAtPrice && (
                <span className="radius-bundle__product-price-compare"
                    style={{
                        textDecoration: "line-through",
                        opacity: 0.6,
                        fontSize: "0.9em",
                    }}
                >
                    {product.compareAtPrice}
                </span>
            )}
        </div>
    );

    const quantityEl = displayOptions.showQuantity && (
        <div style={{ opacity: 0.7, fontSize: "0.9em" }}>
            {DEFAULT_LABELS.quantityLabel} {product.quantity}
        </div>
    );

    if (variant === "vertical") {
        return (
            <div
                style={{
                    ...cardStyle,
                    position: product.badge ? "relative" : undefined,
                    fontSize,
                    color: styles.textColor,
                    textAlign: styles.imagePosition === "top"
                        ? "center"
                        : undefined
                }}
            >
                {badgeEl}
                {displayOptions.showImages && (
                    <div className="radius-bundle__product-image"
                        style={{
                            height: imageSizePx,
                            borderRadius: cardRadius,
                            marginBottom: gap,
                            backgroundColor: "#f3f4f6",
                            overflow: "hidden",
                        }}
                    >
                        {imageEl}
                    </div>
                )}
                <div
                    style={{
                        fontWeight: 500,
                        marginBottom: "8px",
                        textAlign: styles.imagePosition === "top"
                            ? "center"
                            : undefined
                }}
                >
                    {titleEl}
                </div>
                <div style={{ marginBottom: "8px" }}>{priceEl}</div>
                {quantityEl}
            </div>
        );
    }

    return (
        <div
            style={{
                ...cardStyle,
                position: product.badge ? "relative" : undefined,
                display: "flex",
                alignItems: "center",
                gap,
                fontSize,
                color: styles.textColor,
            }}
        >
            {badgeEl}
            {displayOptions.showImages && (
                <div className="radius-bundle__product-image"
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
            )}
            <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 500, marginBottom: "4px" }}>
                    {titleEl}
                </div>
                {quantityEl}
            </div>
            <div style={{ textAlign: "right" }}>{priceEl}</div>
        </div>
    );
}
