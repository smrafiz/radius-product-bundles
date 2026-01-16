"use client";
import { useBundleStore } from "@/features/bundles";

export function BundleList() {
    const { displaySettings } = useBundleStore();
    const styleData = displaySettings.style || {};

    const productTextColor =
        styleData.productTextColor && styleData.productTextColor !== ""
            ? styleData.productTextColor
            : styleData.primaryColor || "#303030";

    const RenderSelectedProducts = () => {
        return (
            <div className="radius-bundle__product radius-bundle__product--list"
                 style={{
                     backgroundColor: styleData.productBgColor || "#f7f7f7",
                     borderRadius: `${styleData.productRadius ?? 12}px`,
                     fontSize: `${styleData.productFontSize ?? 14}px`,
                     color: productTextColor,
                     borderColor: styleData.productBorderColor || "#e3e3e3",
                 }}
            >
                <div className="radius-bundle__product-image"
                     style={{
                         width: `${ styleData.imageSize ?? undefined }px`,
                         height: `${ styleData.imageSize ?? undefined }px`,
                         borderRadius: `${ styleData.imageRadius ?? 6 }px`,
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
