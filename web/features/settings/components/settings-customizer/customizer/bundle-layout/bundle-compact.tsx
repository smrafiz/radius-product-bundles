"use client";
import { useBundleStore } from "@/features/bundles";

export function BundleCompact() {
    const { displaySettings } = useBundleStore();
    const styleData = displaySettings.style || {};

    const productTextColor =
        styleData.productTextColor && styleData.productTextColor !== ""
            ? styleData.productTextColor
            : styleData.textColor || "#333333";

    const RenderSelectedProducts = () => {
        return (
            <div className="radius-bundle__product radius-bundle__product--compact"
                 style={{
                     color: productTextColor,
                     fontSize: `${styleData.productFontSize ?? 14}px`,
                 }}
            >
                <div className="radius-bundle__product-image"
                     style={{
                         borderRadius: `${styleData.imageRadius ?? 6}px`,
                         width: `${styleData.imageSize ?? undefined}px`,
                         height: `${styleData.imageSize ?? undefined}px`,
                     }}
                >
                    <s-image
                        ref={(el) => {
                            if (el) {
                                (el as any).objectFit = styleData.imageFit ?? "contain";
                            }
                        }}
                        src="/assets/product-image-placeholder.webp"
                    />
                </div>

                <div className="radius-bundle__product-info">
                    <div className="radius-bundle__product-title">Bundle product</div>
                    <div className="radius-bundle__product-quantity">{styleData.quantityLabel ?? "Qty:"} 1</div>
                </div>

                <div className="radius-bundle__product-price">
                    <div className="radius-bundle__product-price-current">$300.33</div>
                    <div className="radius-bundle__product-price-compare">$600.00</div>
                </div>
            </div>
        );
    };

    return (
        <div
            className="radius-bundle__products radius-bundle__products--compact">
            <RenderSelectedProducts />
            <RenderSelectedProducts />
            <RenderSelectedProducts />
        </div>
    );
}
