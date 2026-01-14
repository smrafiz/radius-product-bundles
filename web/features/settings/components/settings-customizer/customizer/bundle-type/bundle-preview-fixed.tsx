"use client";
import { useBundleStore } from "@/features/bundles";

export function BundlePreviewFixed() {
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
                        width: `${styleData.imageWidth ?? 80}px`,
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
            className="radius-bundle__inner sm:w-125 m-auto"
            style={{
                backgroundColor: styleData.boxBgColor || "#ffffff",
                borderRadius: `${styleData.boxRadius ?? 12}px`,
                borderStyle: "solid",
                borderWidth: `${styleData.boxBorderWidth ?? 1}px`,
                borderColor: styleData.boxBorderColor || "#e3e3e3",
            }}
        >
            <div className="radius-bundle__products radius-bundle__products--list">
                <div className="radius-bundle__header">
                    <div className="radius-bundle__title-wrapper">
                        <div
                            className="radius-bundle__title"
                            style={{
                                fontSize: `${styleData.headingFontSize ?? 20}px`,
                                color: styleData.headingColor || "#303030",
                            }}
                        >{displaySettings.title || ""}</div>
                    </div>
                    {displaySettings.showSavingsBadge && (
                        <div
                            className="radius-bundle__actions"
                            style={{
                                fontSize: `${styleData.badgeFontSize ?? 16}px`,
                            }}
                        >
                            <button
                                className="radius-bundle__badge"
                                style={{
                                    backgroundColor: styleData.badgeBgColor || "#22c55e",
                                    color: styleData.badgeTextColor || "#ffffff",
                                    borderRadius: `${styleData.badgeRadius ?? 8}px`,
                                }}
                            >
                                Save 50%
                            </button>
                        </div>
                    )}
                </div>

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

            {/* Pricing */}
            <div className="radius-bundle__pricing"
                 style={{
                     fontSize: `${styleData.productFontSize ?? 14}px`,
                     color: styleData.productTextColor || "#303030",
                 }}
            >
                <div className="radius-bundle__pricing-row">
                    <span className="radius-bundle__pricing-label">
                        Regular Price:
                    </span>
                    <span className="radius-bundle__price-original">$2,899.96</span>
                </div>

                <div className="radius-bundle__pricing-row radius-bundle__pricing-row--highlight">
                    <span className="radius-bundle__pricing-label">
                        Bundle Price:
                    </span>
                    <span className="radius-bundle__price-discounted">$1,899.96</span>
                </div>

                <div className="radius-bundle__pricing-row radius-bundle__savings">
                    <span className="radius-bundle__savings-label">
                        You save:
                    </span>
                    <span className="radius-bundle__savings-amount">$474.99 (20%)</span>
                </div>

                <div className="radius-bundle__free-shipping">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M5 18H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h3.93a2 2 0 0 1 1.66.9l.82 1.2a2 2 0 0 0 1.66.9H21a2 2 0 0 1 2 2v1" />
                        <circle cx="7" cy="18" r="2" />
                        <circle cx="17" cy="18" r="2" />
                    </svg>
                    <span>Free Shipping</span>
                </div>
            </div>

            {/* Button */}

            <div
                className="radius-bundle__actions"
                style={{
                    fontSize: `${styleData.buttonFontSize ?? 16}px`,
                }}
            >
                <button
                    aria-expanded="false"
                    aria-label="Add bundle to cart"
                    className="radius-bundle__add-to-cart"
                    style={{
                        backgroundColor: styleData.buttonBgColor || "#303030",
                        color: styleData.buttonTextColor || "#fff",
                        borderRadius: `${styleData.buttonRadius ?? 8}px`,
                    }}
                >
                    Add bundle to cart
                </button>
            </div>

        </div>
    );
}
