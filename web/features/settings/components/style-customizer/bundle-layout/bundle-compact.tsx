"use client";

import {
    DEFAULT_LABELS,
    getCardRadius,
    getFontSize,
    getImageSize,
    getSpacing,
    useCustomizerStore,
} from "@/features/settings";

/**
 * Bundle compact layout preview.
 */
export function BundleCompact() {
    const { styles } = useCustomizerStore();

    const cardRadius = getCardRadius(styles.cornerStyle);
    const imageSizePx = getImageSize(styles.imageSize);
    const fontSize = getFontSize(styles.bodySize);
    const gap = getSpacing(styles.spacing);
    const textColor = styles.textColor || "#333";

    /**
     * Renders a single product row.
     */
    function RenderProduct() {
        return (
            <div
                className="radius-bundle__product radius-bundle__product--compact"
                style={{
                    display: "flex",
                    alignItems: "center",
                    gap,
                    color: textColor,
                    fontSize,
                }}
            >
                {/* Image */}
                <div
                    className="radius-bundle__product-image"
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

                {/* Info */}
                <div
                    className="radius-bundle__product-info"
                    style={{ flex: 1 }}
                >
                    <div
                        className="radius-bundle__product-title"
                        style={{ fontWeight: 500 }}
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
            className="radius-bundle__products radius-bundle__products--compact"
            style={{
                display: "flex",
                flexDirection: "column",
                gap,
            }}
        >
            {Array.from({ length: 3 }).map((_, i) => (
                <RenderProduct key={i} />
            ))}
        </div>
    );
}
