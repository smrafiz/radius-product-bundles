"use client";

import { formatPrice, useBundleStore } from "@/features/bundles";
import { useRef } from "react";

export function BundleLayoutCarousel() {
    const { selectedItems, displaySettings } = useBundleStore();
    const carouselRef = useRef<HTMLDivElement>(null);

    if (!selectedItems.length) {
        return (
            <div className="min-h-96 flex flex-col items-center justify-around gap-3">
                <img src="/assets/not-found.svg" alt="No products" className="w-1/2" />
                <span>Please choose product to see the bundle preview</span>
            </div>
        );
    }

    const scroll = (direction: "left" | "right") => {
        if (!carouselRef.current) return;
        const width = carouselRef.current.clientWidth;
        carouselRef.current.scrollBy({
            left: direction === "left" ? -width : width,
            behavior: "smooth",
        });
    };

    return (
        <div className="relative w-full">
            {/* NAV BUTTONS */}
            <button
                onClick={() => scroll("left")}
                className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white shadow rounded-full cursor-pointer w-8 h-8"
            >
                ‹
            </button>

            <button
                onClick={() => scroll("right")}
                className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white shadow rounded-full cursor-pointer w-8 h-8"
            >
                ›
            </button>

            {/* CAROUSEL */}
            <div
                ref={carouselRef}
                className="radius-bundle__products radius-bundle__products--slider"
                style={{ scrollbarWidth: "none" }}
            >
                {selectedItems.map((item, index) => (
                    <div
                        key={item.id ?? index}
                        className="radius-bundle__product radius-bundle__product--slider"
                        style={{ width: "47.8%" }}
                    >
                        {/* IMAGE */}
                        {displaySettings.showImages && item.image && item.image.trim() !== "" && (
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
                                <a href={item.url} className="hover:underline">
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
        </div>
    );
}
