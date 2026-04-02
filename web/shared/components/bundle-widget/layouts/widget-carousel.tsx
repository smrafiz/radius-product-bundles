"use client";

import { useEffect, useRef, useState } from "react";
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
    const isTeleporting = useRef(false);
    const scrollEndTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
    const gap = getSpacing(styles.spacing);

    const slidesPerView = styles.slidesPerView || 3;
    const cloneCount = slidesPerView;
    const slideWidth = `calc((100% - ${slidesPerView - 1} * ${gap}) / ${slidesPerView})`;

    const showArrows =
        styles.carouselNavigation === "arrows" ||
        styles.carouselNavigation === "both";
    const showDots =
        styles.carouselNavigation === "dots" ||
        styles.carouselNavigation === "both";

    // Scroll to real first item on mount (skip pre-clones)
    useEffect(() => {
        const el = carouselRef.current;
        if (!el) return;
        const child = el.children[cloneCount] as HTMLElement;
        if (child) el.scrollLeft = child.offsetLeft;
    }, [cloneCount]);

    const getClosestIndex = (el: HTMLDivElement) => {
        const children = Array.from(el.children) as HTMLElement[];
        let closest = 0;
        let minDist = Infinity;
        children.forEach((child, i) => {
            const dist = Math.abs(child.offsetLeft - el.scrollLeft);
            if (dist < minDist) {
                minDist = dist;
                closest = i;
            }
        });
        return closest;
    };

    const handleScroll = () => {
        if (isTeleporting.current) return;
        const el = carouselRef.current;
        if (!el) return;

        const closest = getClosestIndex(el);
        const realIndex = (closest - cloneCount + products.length) % products.length;
        setActiveIndex(realIndex);

        // Debounce teleport to after smooth scroll settles
        if (scrollEndTimer.current) clearTimeout(scrollEndTimer.current);
        scrollEndTimer.current = setTimeout(() => {
            const children = Array.from(el.children) as HTMLElement[];
            let target: HTMLElement | null = null;
            if (closest < cloneCount) {
                target = children[closest + products.length] ?? null;
            } else if (closest >= cloneCount + products.length) {
                target = children[closest - products.length] ?? null;
            }
            if (target) {
                isTeleporting.current = true;
                el.scrollLeft = target.offsetLeft;
                requestAnimationFrame(() => {
                    isTeleporting.current = false;
                });
            }
        }, 150);
    };

    const scrollToIndex = (realIndex: number) => {
        const el = carouselRef.current;
        if (!el) return;
        const child = el.children[realIndex + cloneCount] as HTMLElement;
        if (!child) return;
        el.scrollTo({ left: child.offsetLeft, behavior: "smooth" });
    };

    const scroll = (direction: "left" | "right") => {
        const next = direction === "left" ? activeIndex - 1 : activeIndex + 1;
        const looped = (next + products.length) % products.length;
        scrollToIndex(looped);
    };

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

    const preClones = products.slice(-cloneCount);
    const postClones = products.slice(0, cloneCount);

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
                {preClones.map((product, i) => (
                    <div key={`pre-${i}`} style={{ flex: `0 0 ${slideWidth}` }}>
                        <WidgetProductCard
                            product={product}
                            styles={styles}
                            displayOptions={displayOptions}
                            labels={labels}
                            variant="vertical"
                        />
                    </div>
                ))}
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
                {postClones.map((product, i) => (
                    <div key={`post-${i}`} style={{ flex: `0 0 ${slideWidth}` }}>
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
                            onClick={() => scrollToIndex(i)}
                            style={{
                                width: "8px",
                                height: "8px",
                                borderRadius: "50%",
                                cursor: "pointer",
                                backgroundColor:
                                    i === activeIndex
                                        ? styles.primaryColor
                                        : "#d1d5db",
                            }}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
