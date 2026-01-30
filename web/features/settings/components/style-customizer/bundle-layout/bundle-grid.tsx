"use client";

import {
    DEFAULT_LABELS,
    getCardRadius,
    getFontSize,
    getImageSize,
    getSpacing,
    getCardBgColor,
    useCustomizerStore,
} from "@/features/settings";

/**
 * Bundle grid layout preview.
 */
export function BundleGrid() {
    const { styles } = useCustomizerStore();

    const imageSizePx = getImageSize(styles.imageSize);
    const cardRadius = getCardRadius(styles.cornerStyle);
    const fontSize = getFontSize(styles.bodySize);
    const gap = getSpacing(styles.spacing);
    const cardBackground = getCardBgColor(styles);

    /**
     * Renders a single product card.
     */
    function RenderProduct() {
        return (
            <div
                className="radius-bundle__product radius-bundle__product--grid"
                style={{
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
                {/* Image */}
                <div
                    className="radius-bundle__product-image"
                    style={{
                        height: imageSizePx,
                        borderRadius: cardRadius,
                        marginBottom: "8px",
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

                {/* Title */}
                <div
                    className="radius-bundle__product-title"
                    style={{ fontWeight: 500, marginBottom: "4px" }}
                >
                    Bundle product
                </div>

                {/* Price */}
                <div
                    className="radius-bundle__product-price"
                    style={{ marginBottom: "4px" }}
                >
                    <span
                        className="radius-bundle__product-price-current"
                        style={{ fontWeight: 600, marginRight: "6px" }}
                    >
                        $300.33
                    </span>
                    <span
                        className="radius-bundle__product-price-compare"
                        style={{
                            textDecoration: "line-through",
                            opacity: 0.6,
                            fontSize: "0.9em",
                        }}
                    >
                        $600.00
                    </span>
                </div>

                {/* Quantity */}
                <div
                    className="radius-bundle__product-quantity"
                    style={{ opacity: 0.7, fontSize: "0.9em" }}
                >
                    {DEFAULT_LABELS.quantityLabel} 1
                </div>
            </div>
        );
    }

    return (
        <div
            className="radius-bundle__products radius-bundle__products--grid"
            style={{
                display: "grid",
                gridTemplateColumns: `repeat(${styles.gridColumns ?? 3}, minmax(0, 1fr))`,
                gap,
            }}
        >
            {Array.from({ length: 4 }).map((_, index) => (
                <RenderProduct key={index} />
            ))}
        </div>
    );
}
