"use client";

import { useState, useRef, useCallback } from "react";
import { WidgetLayoutProps, PreviewProduct } from "@/shared";
import {
    getButtonBgColor,
    getButtonRadius,
    getButtonFontSize,
    getButtonPadding,
    getFontSize,
    getCardRadius,
    getBadgeRadius,
    getHeadingFontSize,
} from "@/features/settings";
import { DEFAULT_LABELS } from "@/features/settings/constants/defaults.constants";

function ProductTile({
    product,
    variant,
    styles,
    labels,
}: {
    product: { title: string; image?: string; price: string; compareAtPrice?: string };
    variant: "trigger" | "reward";
    styles: WidgetLayoutProps["styles"];
    labels?: WidgetLayoutProps["labels"];
}) {
    const isTrigger = variant === "trigger";
    const isReward = !isTrigger;
    const primaryColor = styles.primaryColor || "#e0598b";
    const savingsColor = styles.savingsColor || "#16a34a";
    const accentColor = isTrigger ? primaryColor : savingsColor;
    const bodyFontSize = getFontSize(styles.bodySize);
    const cardRadius = getCardRadius(styles.cornerStyle);
    const freeTagColor = styles.bogoFreeTagColor || "#16a34a";
    const youPayLabel = labels?.bogoYouPayLabel || DEFAULT_LABELS.bogoYouPayLabel;
    const freeText = labels?.bogoFreeText || DEFAULT_LABELS.bogoFreeText;
    const hasDiscount = isReward && !!product.compareAtPrice;
    const isFreePrice = hasDiscount && (product.price === "$0.00" || product.price === "$0");
    const rewardBadgeText = labels?.bogoRewardBadgeText || DEFAULT_LABELS.bogoRewardBadgeText;

    return (
        <div
            style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 8,
                padding: "16px 12px 12px",
                borderRadius: cardRadius,
                background: "#fff",
                border: `1.5px solid ${accentColor}22`,
            }}
        >
            {product.image && (
                <div
                    style={{
                        width: 80,
                        height: 80,
                        borderRadius: cardRadius,
                        overflow: "hidden",
                        background: "#f9fafb",
                        border: `2px solid ${accentColor}33`,
                    }}
                >
                    <img
                        src={product.image}
                        alt={product.title}
                        style={{
                            width: "100%",
                            height: "100%",
                            objectFit: styles.imageFit || "cover",
                        }}
                    />
                </div>
            )}

            <span
                style={{
                    fontSize: parseInt(bodyFontSize) - 6,
                    fontWeight: 500,
                    textTransform: "uppercase",
                    letterSpacing: 0.8,
                    color: accentColor,
                    background: `${accentColor}12`,
                    padding: "3px 10px",
                    borderRadius: 20,
                    lineHeight: "14px",
                }}
            >
                {isTrigger ? youPayLabel : (isFreePrice ? freeText : rewardBadgeText)}
            </span>

            <div
                style={{
                    fontSize: bodyFontSize,
                    fontWeight: 500,
                    color: styles.textColor,
                    textAlign: "center",
                    lineHeight: "1.3",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                    maxWidth: "100%",
                }}
            >
                {product.title}
            </div>

            <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
                <span
                    style={{
                        fontSize: styles.bodySize,
                        fontWeight: 500,
                        color: hasDiscount ? freeTagColor : styles.textColor,
                    }}
                >
                    {isFreePrice ? freeText : product.price}
                </span>
                {hasDiscount && product.compareAtPrice && (
                    <span
                        style={{
                            fontSize: 12,
                            color: "#9ca3af",
                            textDecoration: "line-through",
                        }}
                    >
                        {product.compareAtPrice}
                    </span>
                )}
            </div>
        </div>
    );
}

function chunk<T>(arr: T[], size: number): T[][] {
    const pages: T[][] = [];
    for (let i = 0; i < arr.length; i += size) {
        pages.push(arr.slice(i, i + size));
    }
    return pages;
}

function TileSlider({
    products,
    variant,
    styles,
    labels,
    dotColor,
    perPage,
    flexVal,
}: {
    products: PreviewProduct[];
    variant: "trigger" | "reward";
    styles: WidgetLayoutProps["styles"];
    labels?: WidgetLayoutProps["labels"];
    dotColor: string;
    perPage: number;
    flexVal: number;
}) {
    const pages = chunk(products, perPage);
    const [activeSlide, setActiveSlide] = useState(0);
    const hasDots = pages.length > 1;
    const containerRef = useRef<HTMLDivElement>(null);
    const dragRef = useRef({ startX: 0, dragging: false });
    const [dragPx, setDragPx] = useState(0);
    const [isDragging, setIsDragging] = useState(false);

    const sw = () => containerRef.current?.offsetWidth || 0;

    const goTo = useCallback((idx: number) => {
        setActiveSlide(Math.max(0, Math.min(idx, pages.length - 1)));
        setDragPx(0);
        setIsDragging(false);
    }, [pages.length]);

    const onPointerDown = useCallback((x: number) => {
        dragRef.current = { startX: x, dragging: true };
        setIsDragging(true);
    }, []);
    const onPointerMove = useCallback((x: number) => {
        if (!dragRef.current.dragging) return;
        setDragPx(x - dragRef.current.startX);
    }, []);
    const onPointerUp = useCallback((x: number) => {
        if (!dragRef.current.dragging) return;
        dragRef.current.dragging = false;
        const dx = x - dragRef.current.startX;
        const threshold = sw() * 0.2;
        if (dx < -threshold) goTo(activeSlide + 1);
        else if (dx > threshold) goTo(activeSlide - 1);
        else goTo(activeSlide);
    }, [activeSlide, goTo]);

    return (
        <div ref={containerRef} style={{ flex: flexVal, minWidth: 0, display: "grid", gridTemplateRows: "1fr auto", overflow: "hidden" }}>
            <div
                style={{
                    display: "flex",
                    transform: `translateX(${-activeSlide * sw() + dragPx}px)`,
                    transition: isDragging ? "none" : "transform 0.3s ease",
                    cursor: pages.length > 1 ? (isDragging ? "grabbing" : "grab") : undefined,
                    userSelect: "none",
                }}
                onMouseDown={(e) => { if (pages.length > 1) { e.preventDefault(); onPointerDown(e.clientX); } }}
                onMouseMove={(e) => onPointerMove(e.clientX)}
                onMouseUp={(e) => onPointerUp(e.clientX)}
                onMouseLeave={() => { if (dragRef.current.dragging) onPointerUp(dragRef.current.startX); }}
                onTouchStart={(e) => { if (pages.length > 1) onPointerDown(e.touches[0].clientX); }}
                onTouchMove={(e) => onPointerMove(e.touches[0].clientX)}
                onTouchEnd={(e) => onPointerUp(e.changedTouches[0].clientX)}
            >
                {pages.map((page, pageIdx) => {
                    const cols = page.length === 1 ? 1 : perPage;
                    return (
                        <div
                            key={pageIdx}
                            style={{
                                display: "grid",
                                gridTemplateColumns: `repeat(${cols}, 1fr)`,
                                gap: 8,
                                minWidth: "100%",
                                flexShrink: 0,
                            }}
                        >
                            {page.map((p) => (
                                <ProductTile
                                    key={p.id}
                                    product={p}
                                    variant={variant}
                                    styles={styles}
                                    labels={labels}
                                />
                            ))}
                        </div>
                    );
                })}
            </div>
            {hasDots && (
                <div
                    style={{
                        display: "flex",
                        justifyContent: "center",
                        gap: 5,
                        paddingTop: 8,
                    }}
                >
                    {pages.map((_, i) => (
                        <button
                            key={i}
                            onClick={() => setActiveSlide(i)}
                            style={{
                                width: 6,
                                height: 6,
                                borderRadius: "50%",
                                background: i === activeSlide ? dotColor : "#d1d5db",
                                border: "none",
                                padding: 0,
                                cursor: "pointer",
                                transform: i === activeSlide ? "scale(1.3)" : "none",
                                transition: "background 0.2s, transform 0.2s",
                            }}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}

export function WidgetCompactGrid({
    products,
    styles,
    pricing,
    cartButtonText,
    title,
    subtitle,
    badgeText,
    labels,
}: WidgetLayoutProps) {
    const triggerProducts = products.filter((p) => p.role === "TRIGGER");
    const rewardProducts = products.filter((p) => p.role === "REWARD");
    const singleEach = triggerProducts.length <= 1 && rewardProducts.length <= 1;
    const primaryColor = styles.primaryColor || "#e0598b";
    const savingsColor = styles.savingsColor || "#16a34a";
    const cardRadius = getCardRadius(styles.cornerStyle);
    const isButtonOutline = styles.buttonStyle === "outline";
    const buttonBg = getButtonBgColor(styles);
    const badgeRadius = getBadgeRadius(styles.cornerStyle);
    const accentColor = styles.primaryColor || "#303030";
    const isOutline = styles.badgeStyle === "outline";
    const headingFontSize = getHeadingFontSize(styles.headingSize);


    if (!products.length) {
        return (
            <div
                style={{
                    minHeight: 200,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: styles.textColor,
                    fontSize: 14,
                }}
            >
                Please choose products to see the bundle preview
            </div>
        );
    }

    return (
        <div
            style={{
                display: "flex",
                flexDirection: "column",
                borderRadius: cardRadius,
                overflow: "hidden",
                background: "#f8f9fa",
            }}
        >
            {/* Deal banner */}
            <div
                style={{
                    background: `linear-gradient(135deg, ${primaryColor}, ${primaryColor}CC)`,
                    padding: "14px 20px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                }}
            >
                <div style={{ display: "flex", flexDirection: "column", gap: 2, minWidth: 0 }}>
                    <span
                        style={{
                            color: "#fff",
                            fontSize: headingFontSize,
                            fontWeight: 700,
                        }}
                    >
                        {title || "Special Offer"}
                    </span>
                    {subtitle && (
                        <span
                            style={{
                                color: "rgba(255,255,255,0.8)",
                                fontSize: 12,
                                fontWeight: 400,
                            }}
                        >
                            {subtitle}
                        </span>
                    )}
                </div>
                {badgeText && pricing?.hasDiscount && (
                    <span
                        style={{
                            backgroundColor: isOutline
                                ? "transparent"
                                : accentColor,
                            color: "#ffffff",
                            border: isOutline
                                ? `2px solid ${accentColor}`
                                : "none",
                            fontSize: 11,
                            fontWeight: 700,
                            padding: "4px 12px",
                            borderRadius: badgeRadius,
                            letterSpacing: 0.3,
                        }}
                    >
                        {badgeText}
                    </span>
                )}
            </div>

            {/* Product tiles — 2-col slider per side */}
            <div
                style={{
                    display: "flex",
                    alignItems: "stretch",
                    gap: 0,
                    padding: "16px 16px 8px",
                }}
            >
                <TileSlider
                    products={triggerProducts}
                    variant="trigger"
                    styles={styles}
                    labels={labels}
                    dotColor={primaryColor}
                    perPage={2}
                    flexVal={singleEach ? 1 : 2}
                />

                <div
                    style={{
                        width: 32,
                        flexShrink: 0,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                    }}
                >
                    <div
                        style={{
                            width: 32,
                            height: 32,
                            borderRadius: "50%",
                            background: "#fff",
                            border: "2px solid #e5e7eb",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: 16,
                            fontWeight: 700,
                            color: "#9ca3af",
                        }}
                    >
                        +
                    </div>
                </div>

                <TileSlider
                    products={rewardProducts}
                    variant="reward"
                    styles={styles}
                    labels={labels}
                    dotColor={savingsColor}
                    perPage={1}
                    flexVal={1}
                />
            </div>

            {/* Footer */}
            <div
                style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "8px 16px 16px",
                    gap: 12,
                }}
            >
                {pricing && (
                    <div style={{ display: "flex", flexDirection: "column" }}>
                        <span style={{ fontSize: 11, color: "#6b7280", fontWeight: 500 }}>
                            {labels?.bogoTotalLabel || DEFAULT_LABELS.bogoTotalLabel}
                        </span>
                        <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
                            <span style={{ fontSize: 20, fontWeight: 700, color: styles.textColor }}>
                                {pricing.finalPrice}
                            </span>
                            {pricing.hasDiscount && (
                                <span
                                    style={{
                                        fontSize: 13,
                                        fontWeight: 600,
                                        color: savingsColor,
                                    }}
                                >
                                    {(labels?.bogoSaveText || DEFAULT_LABELS.bogoSaveText).replace("{amount}", pricing.savingsAmount || "")}
                                </span>
                            )}
                        </div>
                    </div>
                )}

                {cartButtonText && (
                    <button
                        style={{
                            display: "inline-flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: 6,
                            padding: getButtonPadding(styles.buttonSize),
                            border: isButtonOutline ? `2px solid ${buttonBg}` : "none",
                            borderRadius: getButtonRadius(styles.cornerStyle),
                            background: isButtonOutline ? "transparent" : buttonBg,
                            color: isButtonOutline ? buttonBg : "#fff",
                            fontSize: getButtonFontSize(styles.buttonSize),
                            fontWeight: 600,
                            cursor: "pointer",
                            whiteSpace: "nowrap",
                        }}
                    >
                        <svg
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        >
                            <circle cx="9" cy="21" r="1" />
                            <circle cx="20" cy="21" r="1" />
                            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
                        </svg>
                        {cartButtonText}
                    </button>
                )}
            </div>
        </div>
    );
}
