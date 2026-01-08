"use client";

import {
    formatPrice,
    useBundleStore,
} from "@/features/bundles";
import { useState, Fragment } from "react";

export function BundleLayoutCarousel() {
    const { selectedItems, displaySettings } = useBundleStore();
    const styleData = displaySettings.style || {};

    const [showAll, setShowAll] = useState(false);

    const visibleItems = showAll ? selectedItems : selectedItems.slice(0, 4);

    const renderSelectedProducts = () => {
        return visibleItems.map((item, index) => (
            <Fragment key={item.id ?? index}>
                <div
                    className="rtpb-bundle-product"
                    style={{
                        backgroundColor: styleData.productBgColor || "#f7f7f7",
                        borderRadius: `${styleData.productRadius ?? 12}px`,
                        fontSize: `${styleData.productFontSize ?? 16}px`,
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
                                        styleData.imageBorderColor ||
                                        "#e3e3e3",
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
                        {displaySettings.showPrices && (
                            <div className="rtpb-product-price">
                                Qty: {item.quantity} ×{" "}
                                {formatPrice(parseFloat(item.price))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Divider */}
                {index < visibleItems.length - 1 && (
                    <div className="radius-bundle__divider-plus"><div className="divider-position">+</div></div>
                )}
            </Fragment>
        ));
    };

    return (
        <Fragment>
            {selectedItems.length > 0 ? (
                <Fragment>
                    <div className="radius-bundle__products radius-bundle__products--list">
                        {renderSelectedProducts()}
                    </div>

                    {selectedItems.length > 4 && (
                        <button
                            className="text-[12px] underline cursor-pointer"
                            onClick={() => setShowAll(!showAll)}
                        >
                            {showAll
                                ? "Show less"
                                : `+ ${
                                    selectedItems.length - 4
                                } more products`}
                        </button>
                    )}
                </Fragment>
            ) : (
                <div className="min-h-96 flex flex-col items-center justify-around gap-3">
                    <div className="rtpb-product-not-found flex justify-center">
                        <img
                            src="/assets/not-found.svg"
                            alt="No products selected"
                            className="w-1/2 h-full object-cover"
                        />
                    </div>
                    <span>
                        Please choose product to see the bundle preview
                    </span>
                </div>
            )}
        </Fragment>
    );
}
