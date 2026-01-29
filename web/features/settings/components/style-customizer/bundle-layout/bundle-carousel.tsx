"use client";

import {
    DEFAULT_LABELS,
    getCardRadius,
    getFontSize,
    getImageSize,
    getSpacing,
    useCustomizerStore,
} from "@/features/settings";
import { useRef } from "react";

export function BundleCarousel() {
    const { styles } = useCustomizerStore();
    const carouselRef = useRef<HTMLDivElement>(null);

    const scroll = (direction: "left" | "right") => {
        if (!carouselRef.current) return;
        const width = carouselRef.current.clientWidth;
        carouselRef.current.scrollBy({
            left: direction === "left" ? -width : width,
            behavior: "smooth",
        });
    };

    const cardRadius = getCardRadius(styles.cornerStyle);
    const imageSizePx = getImageSize(styles.imageSize);
    const fontSize = getFontSize(styles.bodySize);
    const gap = getSpacing(styles.spacing);

    const cardBackground = styles.customizeCardStyle
        ? styles.productCardBg
        : styles.backgroundColor;

    const RenderProduct = () => (
        <div
            className="radius-bundle__product radius-bundle__product--slider"
            style={{
                flex: "0 0 calc(50% - 8px)",
                backgroundColor: cardBackground,
                borderRadius: cardRadius,
                fontSize,
                color: styles.textColor,
                border: styles.productCardBorder
                    ? `1px solid ${styles.borderColor}`
                    : "none",
                boxShadow: styles.productCardShadow
                    ? "0 4px 12px rgba(0,0,0,0.08)"
                    : "none",
                padding: gap,
            }}
        >
            {/* Image */}
            <div
                className="radius-bundle__product-image"
                style={{
                    height: imageSizePx,
                    borderRadius: cardRadius,
                }}
            >
                <s-image
                    ref={(el) => {
                        if (el) {
                            (el as any).objectFit = styles.imageFit;
                        }
                    }}
                    src="/assets/product-image-placeholder.webp"
                />
            </div>

            {/* Title */}
            <div className="radius-bundle__product-title">Bundle product</div>

            {/* Price */}
            <div className="radius-bundle__product-price">
                <div className="radius-bundle__product-price-current">
                    $300.33
                </div>
                <div className="radius-bundle__product-price-compare">
                    $600.00
                </div>
            </div>

            {/* Quantity */}
            <div className="radius-bundle__product-quantity">
                {DEFAULT_LABELS.quantityLabel} 1
            </div>
        </div>
    );

    return (
        <div className="relative w-full">
            {/* NAV BUTTONS */}
            <button
                onClick={() => scroll("left")}
                className="absolute left-2 top-1/2 -translate-y-1/2 z-10 bg-white shadow rounded-full w-8 h-8 flex items-center justify-center"
            >
                ‹
            </button>

            <button
                onClick={() => scroll("right")}
                className="absolute right-2 top-1/2 -translate-y-1/2 z-10 bg-white shadow rounded-full w-8 h-8 flex items-center justify-center"
            >
                ›
            </button>

            {/* CAROUSEL */}
            <div
                ref={carouselRef}
                className="radius-bundle__products radius-bundle__products--slider flex overflow-x-auto scroll-smooth"
                style={{
                    gap,
                    scrollbarWidth: "none",
                }}
            >
                {Array.from({ length: 4 }).map((_, i) => (
                    <RenderProduct key={i} />
                ))}
            </div>
        </div>
    );
}
