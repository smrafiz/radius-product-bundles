"use client";

import { useRef, useState } from "react";
import { getSpacing } from "@/features/settings";
import { WidgetLayoutProps, WidgetProductCard } from "@/shared";

export function WidgetCarousel({
    products,
    styles,
    displayOptions,
    showEmptyState = true,
    labels,
}: WidgetLayoutProps) {
    const carouselRef = useRef<HTMLDivElement>(null);
    const [activeIndex, setActiveIndex] = useState(0);
    const gap = getSpacing(styles.spacing);

    const handleScroll = () => {
        const el = carouselRef.current;
        if (!el) return;
        const maxScroll = el.scrollWidth - el.clientWidth;
        if (maxScroll <= 0) return;
        const ratio = el.scrollLeft / maxScroll;
        setActiveIndex(Math.round(ratio * (products.length - 1)));
    };

    const showArrows =
        styles.carouselNavigation === "arrows" ||
        styles.carouselNavigation === "both";
    const showDots =
        styles.carouselNavigation === "dots" ||
        styles.carouselNavigation === "both";

    if (!products.length && showEmptyState) {
        return (
            <div className="flex flex-col items-center justify-around gap-3">
                <span
                    style={{
                        color: styles.textColor,
                        fontSize: styles.bodySize,
                    }}
                >
                    Please choose product to see the bundle preview
                </span>
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

    const slidesPerView = styles.slidesPerView || 3;
    const slideWidth = `calc((100% - ${slidesPerView - 1} * ${gap}) / ${slidesPerView})`;

    return (
        <div
            className="slider-layout"
            style={{ position: "relative", width: "100%" }}
        >
            {showArrows && (
                <>
                    <button
                        onClick={() => scroll("left")}
                        style={{
                            position: "absolute",
                            insetInlineStart: "8px",
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

            <div
                ref={carouselRef}
                onScroll={handleScroll}
                style={{
                    display: "flex",
                    overflowX: "auto",
                    scrollBehavior: "smooth",
                    gap,
                    scrollbarWidth: "none",
                }}
            >
                {products.map((product) => (
                    <div key={product.id} style={{ flex: `0 0 ${slideWidth}` }}>
                        <WidgetProductCard
                            product={product}
                            styles={styles}
                            displayOptions={displayOptions}
                            labels={labels}
                            variant="vertical"
                        />
                    </div>
                ))}
            </div>

            {showDots && (
                <div
                    style={{
                        display: "flex",
                        justifyContent: "center",
                        gap: "8px",
                        marginTop: "20px",
                    }}
                >
                    {products.map((product, i) => (
                        <div
                            key={product.id}
                            style={{
                                width: "8px",
                                height: "8px",
                                borderRadius: "50%",
                                backgroundColor:
                                    i === activeIndex ? styles.primaryColor : "#d1d5db",
                            }}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
