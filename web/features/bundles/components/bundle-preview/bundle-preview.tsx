"use client";

import {
    BundlePreviewStatus,
    calculateBundlePrice,
    calculateDiscountAmount,
    calculateSavingsPercentage,
    formatPrice,
    useBundleStore,
} from "@/features/bundles";

import { useState } from "react";

export function BundlePreview() {
    const { bundleData, selectedItems, displaySettings } = useBundleStore();
    const styleData = displaySettings.style || {};

    const [showAll, setShowAll] = useState(false);

    const visibleItems = showAll ? selectedItems : selectedItems.slice(0, 4);

    const renderSelectedProducts = () => {
        return visibleItems.map((item, index) => (
            <div
                className="rtpb-bundle-product"
                key={index}
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
                    <img
                        src={item.image}
                        alt={item.title}
                        className="w-full h-full object-cover"
                    />
                </div>

                <div className="rtpb-prodict-info">
                    <div className="rtpb-product-title">
                        {item.title.length > 25
                            ? `${item.title.slice(0, 25)}...`
                            : item.title}
                    </div>
                    <div className="rtpb-product-price">
                        Qty: {item.quantity} ×{" "}
                        {formatPrice(parseFloat(item.price))}
                    </div>
                </div>
            </div>
        ));
    };

    const calculatePreviewPricing = () => {
        if (
            !selectedItems.length ||
            !bundleData.discountType ||
            !bundleData.discountValue
        ) {
            return {
                originalPrice: 300,
                discountAmount: 30,
                finalPrice: 270,
                savingsPercentage: 10,
            };
        }

        const originalPrice = calculateBundlePrice(selectedItems);
        const discountAmount = calculateDiscountAmount(
            originalPrice,
            bundleData.discountType,
            bundleData.discountValue,
            bundleData.maxDiscountAmount,
        );
        const finalPrice = Math.max(0, originalPrice - discountAmount);
        const savingsPercentage = calculateSavingsPercentage(
            originalPrice,
            finalPrice,
        );

        return {
            originalPrice,
            discountAmount,
            finalPrice,
            savingsPercentage,
        };
    };

    const { originalPrice, discountAmount, finalPrice, savingsPercentage } =
        calculatePreviewPricing();

    return (
        <div className="flex flex-col gap-4">
            <BundlePreviewStatus />

            <div
                className="rtpb-bundle-layout-one"
                style={{
                    backgroundColor: styleData.boxBgColor || "#ffffff",
                    borderRadius: `${styleData.boxRadius ?? 12}px`,
                    color: styleData.boxTextColor || "#303030",
                    ...((styleData.boxBorderEnabled ?? true)
                        ? {
                              borderStyle: "solid",
                              borderWidth: "1px",
                              borderColor:
                                  styleData.boxBorderColor || "#e3e3e3",
                          }
                        : {}),
                }}
            >
                <div className="rtpb-box-wrap">
                    <div className="font-semibold">
                        {displaySettings.title || ""}
                    </div>

                    {selectedItems.length > 0 ? (
                        <div className="rtpb-box-container">
                            <div className="rtpb-product-item">
                                {renderSelectedProducts()}
                            </div>

                            {selectedItems.length > 4 && (
                                <button
                                    className="text-[12px] underline cursor-pointer"
                                    onClick={() => setShowAll(!showAll)}
                                >
                                    {showAll
                                        ? "Show less"
                                        : `+ ${selectedItems.length - 4} more products`}
                                </button>
                            )}

                            {/* Pricing */}
                            <div className="rtpb-product-total-price">
                                {displaySettings.showPrices && (
                                    <div className="rtpb-product-original-price">
                                        <div className="rtpb-product-original-wrap">
                                            <span className="font-semibold">
                                                Original Price:
                                            </span>
                                            {discountAmount > 0 && (
                                                <span>
                                                    {formatPrice(originalPrice)}
                                                </span>
                                            )}
                                        </div>

                                        <div className="rtpb-product-original-wrap">
                                            <span className="font-semibold">
                                                Total Price:
                                            </span>
                                            <span>
                                                {formatPrice(finalPrice)}
                                            </span>
                                        </div>
                                    </div>
                                )}

                                {displaySettings.showSavings &&
                                    discountAmount > 0 && (
                                        <div className="rtpb-product-original-wrap">
                                            <span className="font-semibold">
                                                You save:
                                            </span>
                                            <span>
                                                {formatPrice(discountAmount)} (
                                                {savingsPercentage}%)
                                            </span>
                                        </div>
                                    )}
                            </div>
                            <div className="rtpb-summary-button">
                                <button
                                    aria-expanded="false"
                                    aria-label={
                                        displaySettings.cartButtonText || ""
                                    }
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
                                    {displaySettings.cartButtonText || ""}
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="min-h-96 flex flex-col items-center justify-center gap-3">
                            <div className="w-[var(--p-font-size-1000)]">
                                <img
                                    src="/assets/not-found.svg"
                                    alt="No products selected"
                                    className="w-full h-full object-cover"
                                />
                            </div>
                            <span>
                                Please choose product to see the bundle preview
                            </span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
