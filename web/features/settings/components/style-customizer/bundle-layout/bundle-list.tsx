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
 * Bundle list layout preview.
 */
export function BundleList() {
    const { styles } = useCustomizerStore();

    const imageSizePx = getImageSize(styles.imageSize);
    const cardRadius = getCardRadius(styles.cornerStyle);
    const fontSize = getFontSize(styles.bodySize);
    const gap = getSpacing(styles.spacing);
    const cardBackground = getCardBgColor(styles);

    const showDivider = styles.dividerStyle !== "none";

    /**
     * Renders a single product card.
     */
    function RenderProduct() {
        return (
            <div
                className="radius-bundle__product radius-bundle__product--list"
                style={{
                    display: "flex",
                    alignItems:
                        styles.imagePosition === "top" ? "stretch" : "center",
                    flexDirection:
                        styles.imagePosition === "top" ? "column" : "row",
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
                {/* Image */}
                <div
                    className="radius-bundle__product-image"
                    style={{
                        width:
                            styles.imagePosition === "top"
                                ? "100%"
                                : imageSizePx,
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

                {/* Info */}
                <div
                    className="radius-bundle__product-info"
                    style={{ flex: 1 }}
                >
                    <div
                        className="radius-bundle__product-title"
                        style={{ fontWeight: 500, marginBottom: "4px" }}
                    >
                        Bundle product
                    </div>
                    <div
                        className="radius-bundle__product-quantity"
                        style={{ opacity: 0.7, fontSize: "0.9em" }}
                    >
                        {DEFAULT_LABELS.quantityLabel} 1
                    </div>
                </div>

                {/* Price */}
                <div
                    className="radius-bundle__product-price"
                    style={{ textAlign: "right" }}
                >
                    <div
                        className="radius-bundle__product-price-current"
                        style={{ fontWeight: 600 }}
                    >
                        $300.33
                    </div>
                    <div
                        className="radius-bundle__product-price-compare"
                        style={{
                            textDecoration: "line-through",
                            opacity: 0.6,
                            fontSize: "0.9em",
                        }}
                    >
                        $600.00
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div
            className="radius-bundle__products radius-bundle__products--list"
            style={{
                display: "flex",
                flexDirection: "column",
                gap,
            }}
        >
            {Array.from({ length: 4 }).map((_, index) => (
                <div key={index}>
                    <RenderProduct />

                    {showDivider && index < 3 && (
                        <div
                            className="radius-bundle__divider"
                            style={{
                                display: "flex",
                                justifyContent: "center",
                                alignItems: "center",
                                padding: "8px 0",
                            }}
                        >
                            {styles.dividerStyle === "plus" ? (
                                <div
                                    className="radius-bundle__divider-plus"
                                    style={{
                                        color: styles.primaryColor,
                                        fontSize: "20px",
                                        fontWeight: 600,
                                    }}
                                >
                                    +
                                </div>
                            ) : (
                                <div
                                    className="radius-bundle__divider-line"
                                    style={{
                                        width: "100%",
                                        height: "1px",
                                        backgroundColor: styles.borderColor,
                                    }}
                                />
                            )}
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
}
