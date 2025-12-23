"use client";
import { useBundleStore } from "@/features/bundles";

export function BundlePreviewBogo() {
    const { displaySettings } = useBundleStore();
    const styleData = displaySettings.style || {};

    const RenderSelectedProducts = () => {
        return (
            <div
                className="rtpb-bundle-product"
                style={{
                    backgroundColor: styleData.productBgColor || "#f7f7f7",
                    borderRadius: `${styleData.productRadius ?? 12}px`,
                    fontSize: `${styleData.productFontSize ?? 14}px`,
                    color: styleData.productTextColor || "#303030",
                    flexDirection: styleData.productAlign || "row",
                    ...((styleData.productBorderEnabled ?? true)
                        ? {
                              borderStyle: "solid",
                              borderWidth: "1px",
                              borderColor:
                                  styleData.productBorderColor || "#e3e3e3",
                          }
                        : {}),
                }}
            >
                <div
                    className="rtpb-product-thumbnail"
                    style={{
                        borderRadius: `${styleData.imageRadius ?? 6}px`,
                        ...((styleData.imageBorderEnabled ?? true)
                            ? {
                                  borderStyle: "solid",
                                  borderWidth: "1px",
                                  borderColor:
                                      styleData.imageBorderColor || "#e3e3e3",
                              }
                            : {}),
                    }}
                >
                    <s-image
                        objectFit="cover"
                        src="/assets/product-image-placeholder.webp"
                    ></s-image>
                </div>

                <div className="rtpb-prodict-info">
                    <div className="rtpb-product-title">Bundle product</div>
                    <div className="rtpb-product-price">Qty: 1 × $600.00</div>
                </div>
            </div>
        );
    };

    return (
        <div
            className="rtpb-bundle-layout-one sm:w-[500px] m-auto"
            style={{
                backgroundColor: styleData.boxBgColor || "#ffffff",
                borderRadius: `${styleData.boxRadius ?? 12}px`,
                color: styleData.boxTextColor || "#303030",
                ...((styleData.boxBorderEnabled ?? true)
                    ? {
                          borderStyle: "solid",
                          borderWidth: "1px",
                          borderColor: styleData.boxBorderColor || "#e3e3e3",
                      }
                    : {}),
            }}
        >
            <div className="rtpb-box-wrap">
                <div className="font-semibold text-xl">BOGO</div>

                <div className="rtpb-box-container">
                    <div className="rtpb-product-item">
                        <RenderSelectedProducts />
                        <RenderSelectedProducts />
                        <RenderSelectedProducts />
                    </div>

                    {/* Pricing */}
                    <div
                        className="rtpb-product-total-price"
                        style={{
                            fontSize: `${styleData.productFontSize ?? 14}px`,
                        }}
                    >
                        <div className="rtpb-product-original-price">
                            <div className="rtpb-product-original-wrap">
                                <span className="font-semibold">
                                    Original Price:
                                </span>
                                <span>$2,899.96</span>
                            </div>

                            <div className="rtpb-product-original-wrap">
                                <span className="font-semibold">
                                    Total Price:
                                </span>
                                <span>$1,899.96</span>
                            </div>
                        </div>

                        <div className="rtpb-product-original-wrap">
                            <span className="font-semibold">You save:</span>
                            <span>$474.99 (20%)</span>
                        </div>
                    </div>

                    <div
                        className="rtpb-summary-button"
                        style={{
                            fontSize: `${styleData.productFontSize ?? 14}px`,
                        }}
                    >
                        <button
                            aria-expanded="false"
                            aria-label="Add bundle to cart"
                            className="rtpb-button"
                            style={
                                (styleData.buttonStyleEnabled ?? true)
                                    ? {
                                          backgroundColor:
                                              styleData.buttonBgColor ||
                                              "#303030",
                                          color:
                                              styleData.buttonTextColor ||
                                              "#fff",
                                          borderRadius: `${styleData.buttonRadius ?? 8}px`,
                                      }
                                    : undefined
                            }
                        >
                            Add bundle to cart
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
