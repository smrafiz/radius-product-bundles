"use client";

import { Fragment, useState } from "react";
import {
    calculateDiscountedPrice,
    formatPrice,
    useBundleStore,
} from "@/features/bundles";

/**
 * Grid layout for bundle product preview
 *
 * Displays products in a responsive grid with proper discounted pricing.
 */
export function BundleLayoutGrid() {
    const { selectedItems, displaySettings, bundleData } = useBundleStore();
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
                    gridTemplateColumns:
                        "repeat(auto-fill, minmax(160px, 1fr))",
                    gap: "16px",
                }}
            >
                {visibleItems.map((item, index) => {
                    const originalPrice =
                        parseFloat(item.price) * item.quantity;
                    const discountedPrice = calculateDiscountedPrice(
                        originalPrice,
                        bundleData.discountType,
                        bundleData.discountValue,
                        bundleData.maxDiscountAmount,
                    );
                    const hasDiscount = discountedPrice < originalPrice;

                    return (
                        <div
                            key={item.id ?? index}
                            className="radius-bundle__product radius-bundle__product--grid"
                        >
                            {/* IMAGE */}
                            {displaySettings.showImages &&
                                item.image &&
                                item.image.trim() !== "" && (
                                    <div className="radius-bundle__product-image">
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
                                <div className="radius-bundle__product-price">
                                    <span className="radius-bundle__product-price-current font-semibold">
                                        {formatPrice(discountedPrice)}
                                    </span>

                                    {displaySettings.showComparePrices &&
                                        hasDiscount && (
                                            <span className="radius-bundle__product-price-compare">
                                                {formatPrice(originalPrice)}
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
                    );
                })}
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
