"use client";

import {
    getCardBgColor,
    getCardRadius,
    getFontSize,
    getImageSize,
    getSpacing,
    PLACEHOLDER_IMAGES,
} from "@/features/settings";
import { WidgetProductCardProps } from "@/shared";
import { DEFAULT_LABELS } from "@/features/settings/constants/defaults.constants";
import { PREVIEW_LABELS } from "@/shared/constants/bundle-widget.constants";

export function WidgetProductCard({
    product,
    styles,
    displayOptions,
    variant = "horizontal",
    showCardStyle = true,
    labels,
}: WidgetProductCardProps) {
    const imageSizePx = getImageSize(styles.imageSize);
    const cardRadius = getCardRadius(styles.cornerStyle);
    const fontSize = getFontSize(styles.bodySize);
    const gap = getSpacing(styles.spacing);
    const cardBackground = getCardBgColor(styles);

    const placeholderKeys = Object.keys(PLACEHOLDER_IMAGES).map(Number);
    const stablePlaceholder =
        PLACEHOLDER_IMAGES[
            placeholderKeys[
                product.id
                    .split("")
                    .reduce((acc, c) => acc + c.charCodeAt(0), 0) %
                    placeholderKeys.length
            ] as keyof typeof PLACEHOLDER_IMAGES
        ];

    const imageSrc =
        product.image && product.image.trim() !== ""
            ? product.image
            : stablePlaceholder;

    const isDefaultVariant =
        product.variantTitle === "Default Title" ||
        product.variantTitle === "Default";
    const fullTitle =
        product.variantTitle && !isDefaultVariant
            ? `${product.title} / ${product.variantTitle}`
            : product.title;
    const truncatedTitle =
        fullTitle.length > 40 ? `${fullTitle.slice(0, 40)}...` : fullTitle;

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
            src={imageSrc}
            alt={product.title}
            loading="lazy"
            onError={(e) => {
                e.currentTarget.src = PLACEHOLDER_IMAGES[1];
            }}
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
                textAlign:
                    styles.imagePosition === "top" ? "center" : undefined,
            }}
        >
            <span
                className="radius-bundle__product-price-current"
                style={{ fontWeight: 600 }}
            >
                {product.price}
            </span>

            {displayOptions.showComparePrices && product.compareAtPrice && (
                <span
                    className="radius-bundle__product-price-compare"
                    style={{
                        textDecoration: "line-through",
                        opacity: 0.6,
                        fontSize: "0.9em",
                        marginInlineStart: "6px",
                    }}
                >
                    {product.compareAtPrice}
                </span>
            )}
        </div>
    );

    const quantityEl = displayOptions.showQuantity && (
        <div style={{ opacity: 0.7, fontSize: "0.9em" }}>
            {labels?.quantityLabel || PREVIEW_LABELS.quantityLabel || "Qty:"}{" "}
            {product.quantity}
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
                    textAlign:
                        styles.imagePosition === "top" ? "center" : undefined,
                }}
            >
                {badgeEl}

                {displayOptions.showImages && (
                    <div
                        className="radius-bundle__product-image"
                        style={{
                            height: imageSizePx,
                            borderRadius: cardRadius,
                            marginBottom: gap,
                            backgroundColor: "#f3f4f6",
                            overflow: "hidden",
                            border: `1px solid ${styles.borderColor}`,
                        }}
                    >
                        {imageEl}
                    </div>
                )}

                <div
                    style={{
                        fontWeight: 500,
                        marginBottom: "8px",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                        textAlign:
                            styles.imagePosition === "top"
                                ? "center"
                                : undefined,
                    }}
                >
                    {titleEl}
                </div>

                <div style={{ marginBottom: "8px" }}>{quantityEl}</div>

                <div>{priceEl}</div>

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
                <div
                    className="radius-bundle__product-image"
                    style={{
                        width: imageSizePx,
                        height: imageSizePx,
                        borderRadius: cardRadius,
                        flexShrink: 0,
                        backgroundColor: "#f3f4f6",
                        overflow: "hidden",
                        border: `1px solid ${styles.borderColor}`,
                    }}
                >
                    {imageEl}
                </div>
            )}

            <div style={{ flex: 1 }}>
                <div
                    style={{
                        fontWeight: 500,
                        marginBottom: "4px",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                    }}
                >
                    {titleEl}
                </div>

                {quantityEl}
            </div>

            <div style={{ textAlign: "right" }}>{priceEl}</div>
        </div>
    );
}
