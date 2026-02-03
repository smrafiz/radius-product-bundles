"use client";

import {
    getSpacing,
    ProductCard,
    useCustomizerStore,
} from "@/features/settings";
import { useRef } from "react";

export function BundleCarousel() {
    const { styles } = useCustomizerStore();
    const carouselRef = useRef<HTMLDivElement>(null);
    const gap = getSpacing(styles.spacing);

    const showArrows =
        styles.carouselNavigation === "arrows" ||
        styles.carouselNavigation === "both";
    const showDots =
        styles.carouselNavigation === "dots" ||
        styles.carouselNavigation === "both";

    const scroll = (direction: "left" | "right") => {
        if (!carouselRef.current) return;
        const width = carouselRef.current.clientWidth;
        carouselRef.current.scrollBy({
            left: direction === "left" ? -width : width,
            behavior: "smooth",
        });
    };

    const slideWidth = `calc(${100 / (styles.slidesPerView || 3)}% - ${gap})`;

    return (
        <div style={{ position: "relative", width: "100%" }}>
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

            <div
                ref={carouselRef}
                style={{
                    display: "flex",
                    overflowX: "auto",
                    scrollBehavior: "smooth",
                    gap,
                    scrollbarWidth: "none",
                }}
            >
                {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} style={{ flex: `0 0 ${slideWidth}` }}>
                        <ProductCard
                            variant="vertical"
                            label="Bundle product"
                            price="$300.33"
                            comparePrice="$600.00"
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
