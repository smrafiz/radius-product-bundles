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

    const RenderSelectedProducts = () => {
        return (
            <div className="radius-bundle__product--carousel"
                 style={{ width: "48.9%" }}
            >
                <div
                    className="radius-bundle__product"
                    style={{
                        backgroundColor: styleData.productBgColor || "#f7f7f7",
                        borderRadius: `${styleData.productRadius ?? 12}px`,
                        fontSize: `${styleData.productFontSize ?? 14}px`,
                        color: styleData.productTextColor || "#303030",
                        borderColor: styleData.productBorderColor || "#e3e3e3",
                    }}
                >
                    <div className="radius-bundle__product-image"
                         style={{
                             borderRadius: `${styleData.imageRadius ?? 6}px`,
                         }}
                    >
                        <s-image
                            objectFit="contain"
                            src="/assets/product-image-placeholder.webp"
                        ></s-image>
                    </div>
                    <div className="radius-bundle__product-title">Bundle product</div>
                    <div className="radius-bundle__product-price">
                        <div className="radius-bundle__product-price-current">$300.33</div>
                        <div className="radius-bundle__product-price-compare">$600.00</div>
                    </div>
                    <div className="radius-bundle__product-quantity">Qty: 1</div>
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
                className="radius-bundle__products radius-bundle__products--carousel"
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
