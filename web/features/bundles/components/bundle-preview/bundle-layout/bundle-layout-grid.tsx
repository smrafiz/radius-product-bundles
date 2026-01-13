"use client";

import {
    formatPrice,
    useBundleStore,
} from "@/features/bundles";
import { Fragment, useState } from "react";

export function BundleLayoutGrid() {
    const { selectedItems, displaySettings } = useBundleStore();
    const styleData = displaySettings.style || {};
    const [showAll, setShowAll] = useState(false);

    const visibleItems = showAll ? selectedItems : selectedItems.slice(0, 4);

    if (!selectedItems.length) {
        return (
            <div className="min-h-96 flex flex-col items-center justify-around gap-3">
                <img
                    src="/assets/not-found.svg"
                    alt="No products selected"
                    className="w-1/2"
                />
                <span>Please choose product to see the bundle preview</span>
            </div>
        );
    }

    return (
        <Fragment>
            {/* GRID CONTAINER */}
            <div
                className="radius-bundle__products radius-bundle__products--grid"
                style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))",
                    gap: "16px",
                }}
            >
                {visibleItems.map((item, index) => (
                    <div
                        key={item.id ?? index}
                        className="radius-bundle__product radius-bundle__product--grid"
                        style={{
                            backgroundColor: styleData.productBgColor || "#f7f7f7",
                            borderRadius: `${styleData.productRadius ?? 12}px`,
                            fontSize: `${styleData.productFontSize ?? 16}px`,
                            color: styleData.productTextColor || "#303030",
                            ...((styleData.productBorderEnabled ?? true)
                                ? {
                                    border: `1px solid ${ styleData.productBorderColor || "#e3e3e3" }`,
                                }
                                : {}),
                        }}
                    >
                        {/* IMAGE */}
                        {displaySettings.showImages && item.image && item.image.trim() !== "" && (
                            <div
                                className="radius-bundle__product-image"
                                style={{
                                    borderRadius: `${styleData.imageRadius ?? 6}px`,
                                }}
                            >
                                <img
                                    src={item.image}
                                    alt={item.title}
                                    className="w-full h-full object-cover"
                                />
                            </div>
                        )}

                        {/* TITLE */}
                        <div className="radius-bundle__product-title">
                            {displaySettings.enableHyperLink ? (
                                <a
                                    href={item.url}
                                    className="hover:underline"
                                >
                                    {item.title.length > 40
                                        ? `${item.title.slice(0, 40)}...`
                                        : item.title}
                                </a>
                            ) : (
                                item.title
                            )}
                        </div>

                        {/* PRICE */}
                        {displaySettings.showPrices && (
                            <div className="radius-bundle__product-price flex flex-col items-center">
                                <span className="radius-bundle__product-price-current font-semibold">
                                    $285.95
                                </span>

                                {displaySettings.showComparePrices && (
                                    <span className="radius-bundle__product-price-compare line-through text-sm opacity-60">
                                        {formatPrice(
                                            parseFloat(item.price),
                                        )}
                                    </span>
                                )}
                            </div>
                        )}

                        {/* QTY */}
                        {displaySettings.showQuantity && (
                            <div className="radius-bundle__product-quantity">
                                Qty: {item.quantity}
                            </div>
                        )}

                    </div>
                ))}
            </div>

            {/* SHOW MORE */}
            {selectedItems.length > 4 && (
                <button
                    className="mt-2 text-[12px] underline cursor-pointer"
                    onClick={() => setShowAll(!showAll)}
                >
                    {showAll
                        ? "Show less"
                        : `+ ${selectedItems.length - 4} more products`}
                </button>
            )}
        </Fragment>
    );
}
