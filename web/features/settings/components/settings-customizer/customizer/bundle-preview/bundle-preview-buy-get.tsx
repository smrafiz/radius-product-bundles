"use client";
import { useBundleStore } from "@/features/bundles";

export function BundlePreviewBuyGet() {
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
                        width: `${styleData.imageWidth ?? 80}px`,
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

                <div className="rtpb-product-info">
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
                <div className="font-semibold text-xl">Buy x Get y</div>

                <div className="rtpb-box-container">
                    <div className="rtpb-product-item">
                        <RenderSelectedProducts />
                        <div className="rtpb-product-divider">
                            <div className="rtpb-product-divider-position">
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="24"
                                    height="24"
                                    viewBox="0 0 32 32"
                                >
                                    <path
                                        fill="currentColor"
                                        d="M22 17h-5v5a1.001 1.001 0 0 1-2 0v-5h-5a1.001 1.001 0 0 1 0-2h5v-5a1.001 1.001 0 0 1 2 0v5h5a1.001 1.001 0 0 1 0 2zM16 0C7.163 0 0 7.16 0 16s7.163 16 16 16 16-7.16 16-16S24.837 0 16 0z"
                                    />
                                </svg>
                            </div>
                        </div>
                        <RenderSelectedProducts />
                        <div className="rtpb-product-divider">
                            <div className="rtpb-product-divider-position">
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="24"
                                    height="24"
                                    viewBox="0 0 32 32"
                                >
                                    <path
                                        fill="currentColor"
                                        d="M22 17h-5v5a1.001 1.001 0 0 1-2 0v-5h-5a1.001 1.001 0 0 1 0-2h5v-5a1.001 1.001 0 0 1 2 0v5h5a1.001 1.001 0 0 1 0 2zM16 0C7.163 0 0 7.16 0 16s7.163 16 16 16 16-7.16 16-16S24.837 0 16 0z"
                                    />
                                </svg>
                            </div>
                        </div>
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
