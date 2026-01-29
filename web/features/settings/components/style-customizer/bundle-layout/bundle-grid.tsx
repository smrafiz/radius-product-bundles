"use client";

import { DEFAULT_LABELS, useCustomizerStore } from "@/features/settings";

export function BundleGrid() {
    const { styles } = useCustomizerStore();

    const productTextColor =
        styles.productTextColor && styles.productTextColor !== ""
            ? styles.productTextColor
            : styles.textColor || "#333333";

    function RenderDummyProduct() {
        return (
            <div
                className="radius-bundle__product radius-bundle__product--grid"
                style={{
                    backgroundColor: styles.productBgColor || "#f7f7f7",
                    borderRadius: `${styles.productRadius ?? 12}px`,
                    fontSize: `${styles.productFontSize ?? 14}px`,
                    color: productTextColor,
                    borderColor: styles.productBorderColor || "#e3e3e3",
                }}
            >
                <div
                    className="radius-bundle__product-image"
                    style={{
                        borderRadius: `${styles.imageRadius ?? 6}px`,
                        height: `${styles.imageSize ?? undefined}px`,
                    }}
                >
                    <s-image
                        ref={(el) => {
                            if (el) {
                                (el as any).objectFit =
                                    styles.imageFit ?? "contain";
                            }
                        }}
                        src="/assets/product-image-placeholder.webp"
                    />
                </div>

                <div className="radius-bundle__product-title">
                    Bundle product
                </div>

                <div className="radius-bundle__product-price">
                    <div className="radius-bundle__product-price-current">
                        $300.33
                    </div>
                    <div className="radius-bundle__product-price-compare">
                        $600.00
                    </div>
                </div>
                <div className="radius-bundle__product-quantity">
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
                gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))",
                gap: "16px",
            }}
        >
            {Array.from({ length: 4 }).map((_, index) => (
                <RenderDummyProduct key={index} />
            ))}
        </div>
    );
}
