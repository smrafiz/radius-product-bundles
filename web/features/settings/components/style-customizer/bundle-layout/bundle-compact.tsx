"use client";

import {
    DEFAULT_LABELS,
    getCardRadius,
    getFontSize,
    getImageSize,
    getSpacing,
    useCustomizerStore,
} from "@/features/settings";

export function BundleCompact() {
    const { styles } = useCustomizerStore();

    const cardRadius = getCardRadius(styles.cornerStyle);
    const imageSizePx = getImageSize(styles.imageSize);
    const fontSize = getFontSize(styles.bodySize);
    const gap = getSpacing(styles.spacing);

    const textColor = styles.textColor || "#333";

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
                <div className="radius-bundle__product-price ml-auto text-right">
                    <div className="radius-bundle__product-price-current">
                        $300.33
                    </div>
                    <div className="radius-bundle__product-price-compare">
                        $600.00
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div
            className="radius-bundle__products radius-bundle__products--compact"
            style={{ display: "grid", gap }}
        >
            {Array.from({ length: 3 }).map((_, i) => (
                <RenderProduct key={i} />
            ))}
        </div>
    );
}
