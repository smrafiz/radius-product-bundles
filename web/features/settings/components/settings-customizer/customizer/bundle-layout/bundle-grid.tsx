"use client";

import {
    useBundleStore,
} from "@/features/bundles";

export function BundleGrid() {

    const { displaySettings } = useBundleStore();
    const styleData = displaySettings.style || {};
    const RenderSelectedProducts = () => {
        return (
            <div className="radius-bundle__product radius-bundle__product--grid"
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
                         borderRadius: `${styleData.imageRadius ?? 6}px`,
                         height: `${ styleData.imageSize ?? undefined }px`,
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

                <div className="radius-bundle__product-title">Bundle product</div>

                <div className="radius-bundle__product-price">
                    <div className="radius-bundle__product-price-current">$300.33</div>
                    <div className="radius-bundle__product-price-compare">$600.00</div>
                </div>
                <div className="radius-bundle__product-quantity">Qty: 1</div>
            </div>
        );
    };

    return(
        <div
            className="radius-bundle__products radius-bundle__products--grid"
            style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))",
                gap: "16px",
            }}
        >
            <RenderSelectedProducts />
            <RenderSelectedProducts />
            <RenderSelectedProducts />
            <RenderSelectedProducts />
        </div>
    )
}