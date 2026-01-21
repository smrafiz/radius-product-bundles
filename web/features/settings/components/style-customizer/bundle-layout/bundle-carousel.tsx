"use client";

import { useBundleStore } from "@/features/bundles";
import { useRef } from "react";

export function BundleCarousel() {
    const { displaySettings } = useBundleStore();
    const styleData = displaySettings.style || {};
    const carouselRef = useRef<HTMLDivElement>(null);

    const scroll = (direction: "left" | "right") => {
        if (!carouselRef.current) return;
        const width = carouselRef.current.clientWidth;
        carouselRef.current.scrollBy({
            left: direction === "left" ? -width : width,
            behavior: "smooth",
        });
    };

    const productTextColor =
        styleData.productTextColor && styleData.productTextColor !== ""
            ? styleData.productTextColor
            : styleData.textColor || "#333333";

    const RenderSelectedProducts = () => {
        return (
            <div
                className="radius-bundle__product radius-bundle__product--slider"
                style={{
                    width: "48.2%",
                    backgroundColor: styleData.productBgColor || "#f7f7f7",
                    borderRadius: `${styleData.productRadius ?? 12}px`,
                    fontSize: `${styleData.productFontSize ?? 14}px`,
                    color: productTextColor,
                    borderColor: styleData.productBorderColor || "#e3e3e3",
                }}
            >
                <div
                    className="radius-bundle__product-image"
                    style={{
                        borderRadius: `${styleData.imageRadius ?? 6}px`,
                        height: `${styleData.imageSize ?? 100}px`,
                    }}
                >
                    <s-image
                        ref={(el) => {
                            if (el) {
                                (el as any).objectFit =
                                    styleData.imageFit ?? "contain";
                            }
                        }}
                        src="/assets/product-image-placeholder.webp"
                    />
                </div>
                <div className="radius-bundle__product-title">
                    Bundle product
                </div>
                <div className="radius-bundle__product-price">
                    <div className="radius-bundle__product-price-current">
                        $300.33
                    </div>
                    <div className="radius-bundle__product-price-compare">
                        $600.00
                    </div>
                </div>
                <div className="radius-bundle__product-quantity">
                    {styleData.quantityLabel ?? "Qty:"} 1
                </div>
            </div>
        );
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
                <RenderSelectedProducts />
                <RenderSelectedProducts />
                <RenderSelectedProducts />
                <RenderSelectedProducts />
            </div>
        </div>
    );
}
