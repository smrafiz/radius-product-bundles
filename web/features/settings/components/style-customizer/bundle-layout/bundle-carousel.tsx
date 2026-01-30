"use client";

import { useRef } from "react";
import {
    DEFAULT_LABELS,
    getCardRadius,
    getFontSize,
    getImageSize,
    getSpacing,
    getCardBgColor,
    useCustomizerStore,
} from "@/features/settings";

/**
 * Bundle carousel/slider layout preview.
 */
export function BundleCarousel() {
    const { styles } = useCustomizerStore();
    const carouselRef = useRef<HTMLDivElement>(null);

    const cardRadius = getCardRadius(styles.cornerStyle);
    const imageSizePx = getImageSize(styles.imageSize);
    const fontSize = getFontSize(styles.bodySize);
    const gap = getSpacing(styles.spacing);
    const cardBackground = getCardBgColor(styles);

    // Navigation visibility based on carouselNavigation setting
    const showArrows =
        styles.carouselNavigation === "arrows" ||
        styles.carouselNavigation === "both";
    const showDots =
        styles.carouselNavigation === "dots" ||
        styles.carouselNavigation === "both";

    /**
     * Scrolls the carousel in a direction.
     */
    const scroll = (direction: "left" | "right") => {
        if (!carouselRef.current) return;
        const width = carouselRef.current.clientWidth;
        carouselRef.current.scrollBy({
            left: direction === "left" ? -width : width,
            behavior: "smooth",
        });
    };

    /**
     * Renders a single product card.
     */
    function RenderProduct() {
        return (
            <div
                className="radius-bundle__product radius-bundle__product--slider"
                style={{
                    flex: `0 0 calc(${100 / (styles.slidesPerView || 3)}% - ${gap})`,
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
                        marginBottom: "8px",
                        backgroundColor: "#f3f4f6",
                        overflow: "hidden",
                    }}
                >
                    <img
                        src="/assets/product-image-placeholder.webp"
                        alt="Product"
                        style={{
                            width: "100%",
                            height: "100%",
                            objectFit: styles.imageFit,
                        }}
                    />
                </div>

                {/* Title */}
                <div
                    className="radius-bundle__product-title"
                    style={{ fontWeight: 500, marginBottom: "4px" }}
                >
                    Bundle product
                </div>

                {/* Price */}
                <div
                    className="radius-bundle__product-price"
                    style={{ marginBottom: "4px" }}
                >
                    <span
                        className="radius-bundle__product-price-current"
                        style={{ fontWeight: 600, marginRight: "6px" }}
                    >
                        $300.33
                    </span>
                    <span
                        className="radius-bundle__product-price-compare"
                        style={{
                            textDecoration: "line-through",
                            opacity: 0.6,
                            fontSize: "0.9em",
                        }}
                    >
                        $600.00
                    </span>
                </div>

                {/* Quantity */}
                <div
                    className="radius-bundle__product-quantity"
                    style={{ opacity: 0.7, fontSize: "0.9em" }}
                >
                    {DEFAULT_LABELS.quantityLabel} 1
                </div>
            </div>
        );
    }

    return (
        <div
            className="radius-bundle__carousel-wrapper"
            style={{ position: "relative", width: "100%" }}
        >
            {/* Navigation Arrows */}
            {showArrows && (
                <>
                    <button
                        onClick={() => scroll("left")}
                        style={{
                            position: "absolute",
                            left: "8px",
                            top: "50%",
                            transform: "translateY(-50%)",
                            zIndex: 10,
                            backgroundColor: "#fff",
                            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                            borderRadius: "50%",
                            width: "32px",
                            height: "32px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            border: "none",
                            cursor: "pointer",
                        }}
                    >
                        ‹
                    </button>

                    <button
                        onClick={() => scroll("right")}
                        style={{
                            position: "absolute",
                            right: "8px",
                            top: "50%",
                            transform: "translateY(-50%)",
                            zIndex: 10,
                            backgroundColor: "#fff",
                            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                            borderRadius: "50%",
                            width: "32px",
                            height: "32px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            border: "none",
                            cursor: "pointer",
                        }}
                    >
                        ›
                    </button>
                </>
            )}

            {/* Carousel */}
            <div
                ref={carouselRef}
                className="radius-bundle__products radius-bundle__products--slider"
                style={{
                    display: "flex",
                    overflowX: "auto",
                    scrollBehavior: "smooth",
                    gap,
                    scrollbarWidth: "none",
                    msOverflowStyle: "none",
                }}
            >
                {Array.from({ length: 4 }).map((_, i) => (
                    <RenderProduct key={i} />
                ))}
            </div>

            {/* Dots */}
            {showDots && (
                <div
                    className="radius-bundle__carousel-dots"
                    style={{
                        display: "flex",
                        justifyContent: "center",
                        gap: "8px",
                        marginTop: "12px",
                    }}
                >
                    {Array.from({ length: 4 }).map((_, i) => (
                        <div
                            key={i}
                            style={{
                                width: "8px",
                                height: "8px",
                                borderRadius: "50%",
                                backgroundColor:
                                    i === 0 ? styles.primaryColor : "#d1d5db",
                            }}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
