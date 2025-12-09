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
                className="rtbp-widget-product-layout-one"
                key={index}
                style={{
                    backgroundColor: styleData.productBgColor || "#f7f7f7",
                    borderRadius: styleData.productRadius || "8px",
                    color: styleData.productTextColor || "#303030",
                    ...(styleData.productBorderEnabled ?? true
                        ? {
                            borderStyle: "solid",
                            borderWidth: "1px",
                            borderColor: styleData.productBorderColor || "#e3e3e3",
                        }
                        : {}),
                }}
            >
                <div>
                    <div className="w-20 h-20 bg-[var(--p-color-bg-surface)] rounded-[var(--p-border-radius-150)] flex items-center justify-center overflow-hidden">
                        <img
                            src={item.image}
                            alt={item.title}
                            className="w-full h-full object-cover"
                        />
                    </div>
                </div>

                <div>
                    <div className="rtpb-product-title">
                        {item.title.length > 25
                            ? `${item.title.slice(0, 25)}...`
                            : item.title}
                    </div>
                    <div className="rtpb-product-price">
                        Qty: {item.quantity} × {formatPrice(parseFloat(item.price))}
                    </div>
                </div>
            </div>
        ));
    };

    const calculatePreviewPricing = () => {
        if (!selectedItems.length || !bundleData.discountType || !bundleData.discountValue) {
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
            bundleData.maxDiscountAmount
        );
        const finalPrice = Math.max(0, originalPrice - discountAmount);
        const savingsPercentage = calculateSavingsPercentage(originalPrice, finalPrice);

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
                className="rtbp-widget-layout-one"
                style={{
                    backgroundColor: styleData.widgetBgColor || "#ffffff",
                    borderRadius: styleData.widgetRadius || "12px",
                    color: styleData.widgetTextColor || "#303030",
                    ...(styleData.widgetBorderEnabled ?? true
                        ? {
                            borderStyle: "solid",
                            borderWidth: "1px",
                            borderColor: styleData.widgetBorderColor || "#e3e3e3",
                        }
                        : {}),
                }}
            >
                <div className="flex flex-col gap-4">
                    <div className="font-semibold">{displaySettings.title || ""}</div>

                    {selectedItems.length > 0 ? (
                        <div className="flex flex-col gap-4">
                            <div className="flex flex-col gap-2">
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

                            <s-divider />

                            {/* Pricing */}
                            <div className="flex flex-col gap-2">
                                {displaySettings.showPrices && (
                                    <div className="flex justify-between">
                                        <div className="gap-2 flex items-center justify-between">
                                            <span className="font-semibold">Original Price:</span>
                                            {discountAmount > 0 && (
                                                <span>{formatPrice(originalPrice)}</span>
                                            )}
                                        </div>

                                        <div className="gap-2 flex items-center justify-between">
                                            <span className="font-semibold">Total Price:</span>
                                            <span>{formatPrice(finalPrice)}</span>
                                        </div>
                                    </div>
                                )}

                                {displaySettings.showSavings && discountAmount > 0 && (
                                    <div className="gap-2 flex items-center justify-between">
                                        <span className="font-semibold">You save:</span>
                                        <span>
                                            {formatPrice(discountAmount)} ({savingsPercentage}%)
                                        </span>
                                    </div>
                                )}
                            </div>

                            <div className="rtpb-summary-button flex justify-center">
                                <button
                                    aria-expanded="false"
                                    aria-label={displaySettings.cartButtonText || ""}
                                    className="rtpb-button"
                                    style={
                                        styleData.buttonStyleEnabled ?? true
                                            ? {
                                                backgroundColor:
                                                    styleData.buttonBgColor || "#303030",
                                                color: styleData.buttonTextColor || "#fff",
                                                borderRadius:
                                                    styleData.buttonRadius || "6px",
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
                            <span>Please choose product to see the bundle preview</span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
