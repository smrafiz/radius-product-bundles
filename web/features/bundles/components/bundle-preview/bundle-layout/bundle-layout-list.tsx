"use client";

import { formatPrice, useBundleStore } from "@/features/bundles";
import { useState, Fragment } from "react";

export function BundleLayoutList() {
    const { selectedItems, displaySettings } = useBundleStore();
    const styleData = displaySettings.style || {};
    const [showAll, setShowAll] = useState(false);

    const visibleItems = showAll
        ? selectedItems
        : selectedItems.slice(0, 4);

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
            <div className="radius-bundle__products radius-bundle__products--list">
                {visibleItems.map((item, index) => (
                    <Fragment key={item.id ?? index}>
                        {/* Product */}
                        <div
                            className="radius-bundle__product radius-bundle__product--list"
                            style={{
                                backgroundColor: styleData.productBgColor || "#f7f7f7",
                                borderRadius: `${styleData.productRadius ?? 12}px`,
                                fontSize: `${styleData.productFontSize ?? 16}px`,
                                color: styleData.productTextColor || "#303030",
                                ...(styleData.productBorderEnabled ?? true
                                    ? {
                                        border: `1px solid ${
                                            styleData.productBorderColor ||
                                            "#e3e3e3"
                                        }`,
                                    }
                                    : {}),
                            }}
                        >
                            {/* Image */}
                            {displaySettings.showImages && item.image && item.image.trim() !== "" && (
                                <div
                                    className="radius-bundle__product-image"
                                    style={{
                                        width: `${ styleData.imageWidth ?? 70 }px`,
                                        height: `${ styleData.imageWidth ?? 70 }px`,
                                        borderRadius: `${ styleData.imageRadius ?? 6 }px`,
                                    }}
                                >
                                    <img
                                        src={item.image}
                                        alt={item.title}
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                            )}

                            {/* Info */}
                            <div className="radius-bundle__product-info">
                                <div className="radius-bundle__product-title">
                                    {displaySettings.enableHyperLink ? (
                                        <a
                                            href={item.url}
                                            className="hover:underline"
                                        >
                                            {item.title.length > 40
                                                ? `${item.title.slice(
                                                    0,
                                                    40,
                                                )}...`
                                                : item.title}
                                        </a>
                                    ) : (
                                        <span>
                                            {item.title.length > 40
                                                ? `${item.title.slice(
                                                    0,
                                                    40,
                                                )}...`
                                                : item.title}
                                        </span>
                                    )}
                                </div>

                                <div className="radius-bundle__product-quantity">
                                    Qty: {item.quantity}
                                </div>
                            </div>

                            {/* Price */}
                            {displaySettings.showPrices && (
                                <div className="radius-bundle__product-price">
                                    <span className="radius-bundle__product-price-current">
                                        $285.95
                                    </span>

                                    {displaySettings.showComparePrices && (
                                        <span className="radius-bundle__product-price-compare">
                                            {formatPrice(
                                                parseFloat(item.price),
                                            )}
                                        </span>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Divider */}
                        {index < visibleItems.length - 1 && (
                            <div className="radius-bundle__divider-plus">
                                <div className="divider-position">+</div>
                            </div>
                        )}
                    </Fragment>
                ))}
            </div>

            {selectedItems.length > 4 && (
                <button
                    className="text-[12px] underline cursor-pointer mt-2"
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
