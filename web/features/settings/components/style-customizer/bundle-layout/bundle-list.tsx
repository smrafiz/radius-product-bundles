"use client";

import {
    DEFAULT_LABELS,
    getCardRadius,
    getFontSize,
    getImageSize,
    getSpacing,
    useCustomizerStore,
} from "@/features/settings";

export function BundleList() {
    const { styles } = useCustomizerStore();

    const imageSizePx = getImageSize(styles.imageSize);
    const cardRadius = getCardRadius(styles.cornerStyle);
    const fontSize = getFontSize(styles.bodySize);
    const gap = getSpacing(styles.spacing);

    const showDivider = styles.dividerStyle !== "none";

    const cardBackground = styles.customizeCardStyle
        ? styles.productCardBg
        : styles.backgroundColor;

    const RenderDummyProduct = () => (
        <div
            className="radius-bundle__product radius-bundle__product--list"
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
                    width: imageSizePx,
                    height: imageSizePx,
                    borderRadius: cardRadius,
                }}
            >
                <s-image
                    ref={(el) => {
                        if (el) {
                            (el as any).objectFit = styles.imageFit;
                        }
                    }}
                    src="/assets/product-image-placeholder.webp"
                />
            </div>

            {/* Info */}
            <div className="radius-bundle__product-info">
                <div className="radius-bundle__product-title">
                    Bundle product
                </div>
                <div className="radius-bundle__product-quantity">
                    {DEFAULT_LABELS.quantityLabel} 1
                </div>
            </div>

            {/* Price */}
            <div className="radius-bundle__product-price">
                <div className="radius-bundle__product-price-current">
                    $300.33
                </div>
                <div className="radius-bundle__product-price-compare">
                    $600.00
                </div>
            </div>
        </div>
    );

    return (
        <div
            className="radius-bundle__products radius-bundle__products--list"
            style={{ gap }}
        >
            {Array.from({ length: 4 }).map((_, index) => (
                <div key={index}>
                    <RenderDummyProduct />

                    {showDivider && index < 3 && (
                        <div className="radius-bundle__divider">
                            {styles.dividerStyle === "plus" ? (
                                <div
                                    className="radius-bundle__divider-plus"
                                    style={{ color: styles.primaryColor }}
                                >
                                    +
                                </div>
                            ) : (
                                <div
                                    className="radius-bundle__divider-line"
                                    style={{
                                        borderColor: styles.borderColor,
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
