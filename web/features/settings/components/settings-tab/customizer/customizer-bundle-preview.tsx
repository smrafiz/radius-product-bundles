"use client";
import { useBundleStore } from "@/features/bundles";

import { CustomizerBundleType } from "./customizer-bundle-type";

export function CustomizerBundlePreview() {
    const { displaySettings } = useBundleStore();
    const styleData = displaySettings.style || {};

    const RenderSelectedProducts = () => {
        return (
            <div
                className="rtbp-widget-product-layout-one"
                style={{
                    backgroundColor: styleData.productBgColor || "#f7f7f7",
                    borderRadius: styleData.productRadius || "12px",
                    color: styleData.productTextColor || "#303030",
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
                <div className="w-20 h-20 bg-[var(--p-color-bg-surface)] rounded-[var(--p-border-radius-150)] flex items-center justify-center overflow-hidden">
                    <s-image objectFit="cover" src=""></s-image>
                </div>

                <div className="rtpb-product-info">
                    <div className="rtpb-product-title">Bundle product</div>
                    <div className="rtpb-product-price">Qty: 1 × $600.00</div>
                </div>
            </div>
        );
    };

    return (
        <s-section>
            <div className="flex gap-4">

                <CustomizerBundleType />

                <div
                    className="rtbp-widget-layout-one w-[500px] m-auto"
                    style={{
                        backgroundColor: styleData.widgetBgColor || "#ffffff",
                        borderRadius: styleData.widgetRadius || "12px",
                        color: styleData.widgetTextColor || "#303030",
                        ...((styleData.widgetBorderEnabled ?? true)
                            ? {
                                  borderStyle: "solid",
                                  borderWidth: "1px",
                                  borderColor:
                                      styleData.widgetBorderColor || "#e3e3e3",
                              }
                            : {}),
                    }}
                >
                    <div className="flex flex-col gap-4">
                        <div className="font-semibold text-xl">
                            Bundle Offers
                        </div>

                        <div className="flex flex-col gap-4">
                            <div className="flex flex-col gap-2">
                                <RenderSelectedProducts />
                                <RenderSelectedProducts />
                                <RenderSelectedProducts />
                            </div>

                            {/* Pricing */}
                            <div className="flex flex-col gap-2">
                                <div className="flex justify-between">
                                    <div className="gap-2 flex items-center justify-between">
                                        <span className="font-semibold">
                                            Original Price:
                                        </span>
                                        <span>$2,899.96</span>
                                    </div>

                                    <div className="gap-2 flex items-center justify-between">
                                        <span className="font-semibold">
                                            Total Price:
                                        </span>
                                        <span>$1,899.96</span>
                                    </div>
                                </div>

                                <div className="gap-2 flex items-center justify-between">
                                    <span className="font-semibold">
                                        You save:
                                    </span>
                                    <span>$474.99 (20%)</span>
                                </div>
                            </div>

                            <div className="rtpb-summary-button flex justify-center">
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
                                                  borderRadius:
                                                      styleData.buttonRadius ||
                                                      "8px",
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
            </div>
        </s-section>
    );
}
