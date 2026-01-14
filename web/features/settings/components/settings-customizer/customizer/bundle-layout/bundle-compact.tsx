"use client";
import { useBundleStore } from "@/features/bundles";

export function BundleCompact() {
    const { displaySettings } = useBundleStore();
    const styleData = displaySettings.style || {};

    const RenderSelectedProducts = () => {
        return (
            <div className="radius-bundle__product radius-bundle__product--compact"
                 style={{
                     color: styleData.productTextColor || "#303030",
                     fontSize: `${styleData.productFontSize ?? 14}px`,
                 }}
            >
                <div className="radius-bundle__product-image"
                     style={{
                         borderRadius: `${styleData.imageRadius ?? 6}px`,
                     }}
                >
                    <s-image
                        objectFit="cover"
                        src="/assets/product-image-placeholder.webp"
                    ></s-image>
                </div>

                <div className="radius-bundle__product-info">
                    <div className="radius-bundle__product-title">Bundle product</div>
                    <div className="radius-bundle__product-quantity">Qty: 1</div>
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
