"use client";
import { useBundleStore } from "@/features/bundles";

export function BundleList() {
    const { displaySettings } = useBundleStore();
    const styleData = displaySettings.style || {};

    const RenderSelectedProducts = () => {
        return (
            <div className="radius-bundle__product radius-bundle__product--list"
                 style={{
                     backgroundColor: styleData.productBgColor || "#f7f7f7",
                     borderRadius: `${styleData.productRadius ?? 12}px`,
                     fontSize: `${styleData.productFontSize ?? 14}px`,
                     color: styleData.productTextColor || "#303030",
                     borderColor: styleData.productBorderColor || "#e3e3e3",
                 }}
            >
                <div className="radius-bundle__product-image"
                     style={{
                         width: `${ styleData.imageWidth ?? 70 }px`,
                         height: `${ styleData.imageWidth ?? 70 }px`,
                         borderRadius: `${ styleData.imageRadius ?? 6 }px`,
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
            className="radius-bundle__products radius-bundle__products--list">
            <RenderSelectedProducts />
            <div className="radius-bundle__divider-plus">
                <div className="divider-position">+</div>
            </div>
            <RenderSelectedProducts />
            <div className="radius-bundle__divider-plus">
                <div className="divider-position">+</div>
            </div>
            <RenderSelectedProducts />
        </div>
    );
}
