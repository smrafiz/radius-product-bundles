"use client";

import { useState, useRef, useCallback } from "react";
import { WidgetLayoutProps, PreviewProduct, PREVIEW_LABELS } from "@/shared";
import {
    getButtonBgColor,
    getButtonRadius,
    getButtonFontSize,
    getButtonPadding,
    getFontSize,
    getCardRadius,
    getBadgeRadius,
    getHeadingFontSize,
    getCardBgColor,
    getImageSize,
    getPadding,
} from "@/features/settings";
import { DEFAULT_LABELS } from "@/features/settings/constants/defaults.constants";

function getRewardBadge(
    product: { price: string; compareAtPrice?: string },
    labels?: WidgetLayoutProps["labels"],
    discountType?: string,
): string {
    const isFreePrice =
        !!product.compareAtPrice &&
        /^[^1-9]*$/.test(product.price || "");
    if (isFreePrice) return labels?.bogoRewardBadgeText || "You Get";

    if (discountType === "CUSTOM_PRICE") {
        return labels?.bogoRewardBadgeText || "You Get";
    }

    if (product.compareAtPrice && product.price) {
        const parse = (s: string) =>
            parseFloat(s.replace(/[^0-9.]/g, "")) || 0;
        const orig = parse(product.compareAtPrice);
        const curr = parse(product.price);
        if (orig > curr && orig > 0) {
            if (discountType === "FIXED_AMOUNT") {
                const symbol = (product.compareAtPrice.match(/[^0-9.,\s]/) || ["$"])[0];
                const savings = orig - curr;
                const amt = savings % 1 === 0
                    ? `${symbol}${savings}`
                    : `${symbol}${savings.toFixed(2).replace(/\.00$/, "")}`;
                return `${amt} Off`;
            }
            const pct = Math.round(((orig - curr) / orig) * 100);
            return `${pct}%`;
        }
    }

    return labels?.bogoRewardBadgeText || "You Get";
}

function ProductTile({
    product,
    variant,
    styles,
    displayOptions,
    labels,
    pricing,
    bundleType,
    discountType,
}: {
    product: {
        title: string;
        variantTitle?: string;
        image?: string;
        price: string;
        compareAtPrice?: string;
        quantity?: number;
        url?: string;
    };
    variant: "trigger" | "reward";
    styles: WidgetLayoutProps["styles"];
    displayOptions: WidgetLayoutProps["displayOptions"];
    labels?: WidgetLayoutProps["labels"];
    pricing?: WidgetLayoutProps["pricing"];
    bundleType?: string;
    discountType?: string;
}) {
    const isTrigger = variant === "trigger";
    const isReward = !isTrigger;
    const primaryColor = styles.primaryColor || "#e0598b";
    const savingsColor = styles.savingsColor || "#16a34a";
    const accentColor = isTrigger ? primaryColor : savingsColor;
    const bodyFontSize = getFontSize(styles.bodySize);
    const cardRadius = getCardRadius(styles.cornerStyle);
    const imageSizePx = getImageSize(styles.imageSize);
    const youPayLabel =
        labels?.bogoYouPayLabel || PREVIEW_LABELS.bogoYouPayLabel;
    const freeText = labels?.bogoFreeText || PREVIEW_LABELS.bogoFreeText;
    const hasDiscount = isReward && !!product.compareAtPrice;
    const isFreePrice = hasDiscount && /^[^1-9]*$/.test(product.price || "");
    const isDefaultVariant = product.variantTitle === "Default Title" || product.variantTitle === "Default";
    const displayTitle = product.variantTitle && !isDefaultVariant
        ? `${product.title} / ${product.variantTitle}`
        : product.title;
    const titleEl =
        displayOptions.enableHyperLink && product.url ? (
            <a href={product.url} className="hover:underline">
                {displayTitle}
            </a>
        ) : (
            <span>{displayTitle}</span>
        );
    const rewardBadge = getRewardBadge(product, labels, discountType);
    const cardBg = styles.customizeCardStyle
        ? getCardBgColor(styles)
        : undefined;
    const quantityEl = displayOptions.showQuantity && bundleType !== "BOGO" && (
        <div style={{ opacity: 0.7, fontSize: "0.9em" }}>
            {labels?.quantityLabel || PREVIEW_LABELS.quantityLabel || "Qty:"}{" "}
            {product.quantity}
        </div>
    );

    return (
        <div
            style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 8,
                padding: "16px 12px 12px",
                borderRadius: cardRadius,
                backgroundColor: cardBg,
                border: `1px solid ${accentColor}22`,
            }}
        >
            {product.image && displayOptions.showImages && (
                <div
                    style={{
                        width: imageSizePx,
                        height: imageSizePx,
                        borderRadius: cardRadius,
                        overflow: "hidden",
                        background: styles.productCardBg || "#f9fafb",
                        border: `1px solid ${accentColor}33`,
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

            {displayOptions.showSavingsBadge && (
                <span
                    style={{
                        fontSize: parseInt(bodyFontSize) - 4,
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
                    {isTrigger ? youPayLabel : rewardBadge}
                </span>
            )}

            <div
                style={{
                    fontSize: bodyFontSize,
                    fontWeight: 500,
                    color: styles.textColor,
                    textAlign: "center",
                    lineHeight: "1.3",
                    display: "-webkit-box",
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: "vertical",
                    overflow: "hidden",
                    whiteSpace: "normal",
                    maxWidth: "100%",
                }}
            >
                {titleEl}
            </div>

            {quantityEl}

            <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
                {displayOptions.showPrices && (
                    <span
                        style={{
                            fontSize: bodyFontSize,
                            fontWeight: 600,
                            color: hasDiscount
                                ? savingsColor
                                : styles.textColor,
                        }}
                    >
                        {isFreePrice ? freeText : product.price}
                    </span>
                )}
                {hasDiscount &&
                    product.compareAtPrice &&
                    displayOptions.showComparePrices && (
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
    displayOptions,
    labels,
    pricing,
    dotColor,
    perPage,
    flexVal,
    activeDevice,
    bundleType,
    discountType,
}: {
    products: PreviewProduct[];
    variant: "trigger" | "reward";
    styles: WidgetLayoutProps["styles"];
    displayOptions: WidgetLayoutProps["displayOptions"];
    labels?: WidgetLayoutProps["labels"];
    pricing?: WidgetLayoutProps["pricing"];
    dotColor: string;
    perPage: number;
    flexVal: number;
    activeDevice?: "desktop" | "tablet" | "mobile";
    bundleType?: string;
    discountType?: string;
}) {
    const pages = chunk(products, perPage);
    const [activeSlide, setActiveSlide] = useState(0);
    const hasDots = pages.length > 1;
    const containerRef = useRef<HTMLDivElement>(null);
    const dragRef = useRef({ startX: 0, dragging: false });
    const [dragPx, setDragPx] = useState(0);
    const [isDragging, setIsDragging] = useState(false);

    const sw = () => containerRef.current?.offsetWidth || 0;

    const goTo = useCallback(
        (idx: number) => {
            setActiveSlide(Math.max(0, Math.min(idx, pages.length - 1)));
            setDragPx(0);
            setIsDragging(false);
        },
        [pages.length],
    );

    const onPointerDown = useCallback((x: number) => {
        dragRef.current = { startX: x, dragging: true };
        setIsDragging(true);
    }, []);
    const onPointerMove = useCallback((x: number) => {
        if (!dragRef.current.dragging) return;
        setDragPx(x - dragRef.current.startX);
    }, []);
    const onPointerUp = useCallback(
        (x: number) => {
            if (!dragRef.current.dragging) return;
            dragRef.current.dragging = false;
            const dx = x - dragRef.current.startX;
            const threshold = sw() * 0.2;
            if (dx < -threshold) goTo(activeSlide + 1);
            else if (dx > threshold) goTo(activeSlide - 1);
            else goTo(activeSlide);
        },
        [activeSlide, goTo],
    );

    return (
        <div
            ref={containerRef}
            style={{
                flex: flexVal,
                minWidth: 0,
                overflow: "hidden",
            }}
        >
            <div
                style={{
                    display: "flex",
                    transform: `translateX(${-activeSlide * sw() + dragPx}px)`,
                    transition: isDragging ? "none" : "transform 0.3s ease",
                    cursor:
                        pages.length > 1
                            ? isDragging
                                ? "grabbing"
                                : "grab"
                            : undefined,
                    userSelect: "none",
                }}
                onMouseDown={(e) => {
                    if (pages.length > 1) {
                        e.preventDefault();
                        onPointerDown(e.clientX);
                    }
                }}
                onMouseMove={(e) => onPointerMove(e.clientX)}
                onMouseUp={(e) => onPointerUp(e.clientX)}
                onMouseLeave={() => {
                    if (dragRef.current.dragging)
                        onPointerUp(dragRef.current.startX);
                }}
                onTouchStart={(e) => {
                    if (pages.length > 1) onPointerDown(e.touches[0].clientX);
                }}
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
                                gridTemplateColumns:
                                    activeDevice === "mobile"
                                        ? "repeat(1, 1fr)"
                                        : `repeat(${cols}, 1fr)`,
                                gap: 8,
                                minWidth: "100%",
                            }}
                        >
                            {page.map((p) => (
                                <ProductTile
                                    key={p.id}
                                    product={p}
                                    variant={variant}
                                    styles={styles}
                                    displayOptions={displayOptions}
                                    labels={labels}
                                    pricing={pricing}
                                    bundleType={bundleType}
                                    discountType={discountType}
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
                        paddingBottom: 8,
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
                                background:
                                    i === activeSlide ? dotColor : "#d1d5db",
                                border: "none",
                                padding: 0,
                                cursor: "pointer",
                                transform:
                                    i === activeSlide ? "scale(1.3)" : "none",
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
    displayOptions,
    pricing,
    cartButtonText,
    title,
    subtitle,
    badgeText,
    labels,
    activeDevice,
    bundleType,
    discountType,
}: WidgetLayoutProps) {
    const triggerProducts = products.filter((p) => p.role === "TRIGGER");
    const rewardProducts = products.filter((p) => p.role === "REWARD");
    const singleEach =
        triggerProducts.length <= 1 && rewardProducts.length <= 1;
    const primaryColor = styles.primaryColor || "#e0598b";
    const savingsColor = styles.savingsColor || "#16a34a";
    const cardRadius = getCardRadius(styles.cornerStyle);
    const isButtonOutline = styles.buttonStyle === "outline";
    const buttonBg = getButtonBgColor(styles);
    const badgeRadius = getBadgeRadius(styles.cornerStyle);
    const accentColor = styles.primaryColor || "#303030";
    const isOutline = styles.badgeStyle === "outline";
    const headingFontSize = getHeadingFontSize(styles.headingSize);
    const bodyFontSize = getFontSize(styles.bodySize);
    const padding = getPadding(styles.spacing);

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
                border: styles.showBorder
                    ? `1px solid ${styles.borderColor}`
                    : "none",
                overflow: "hidden",
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
                <div
                    style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 2,
                        minWidth: 0,
                        flex: 1,
                    }}
                >
                    <h3
                        style={{
                            color: "#fff",
                            fontSize: headingFontSize,
                            fontWeight: 600,
                            margin: 0,
                        }}
                    >
                        {title || PREVIEW_LABELS.headingLabel}
                    </h3>
                    {subtitle && (
                        <p
                            style={{
                                color: "rgba(255,255,255,0.8)",
                                fontSize: bodyFontSize,
                                fontWeight: 400,
                            }}
                        >
                            {subtitle}
                        </p>
                    )}
                </div>
                {badgeText &&
                    pricing?.hasDiscount &&
                    displayOptions.showSavingsBadge && (
                        <span
                            style={{
                                backgroundColor: isOutline
                                    ? "transparent"
                                    : accentColor,
                                color: "#ffffff",
                                border: isOutline
                                    ? `2px solid ${accentColor}`
                                    : "none",
                                fontSize: parseInt(bodyFontSize) - 5,
                                fontWeight: 600,
                                padding: "4px 12px",
                                borderRadius: badgeRadius,
                                letterSpacing: 0.3,
                            }}
                        >
                            {badgeText}
                        </span>
                    )
                }
            </div>

            {/* Product tiles — 2-col slider per side */}
            <div
                style={{
                    display: "flex",
                    alignItems: "stretch",
                    flexDirection: activeDevice === "mobile" ? "column" : "row",
                    gap: 4,
                    padding: `${parseInt(padding)}px ${parseInt(padding)}px 10px`,

                }}
            >
                <TileSlider
                    products={triggerProducts}
                    variant="trigger"
                    styles={styles}
                    displayOptions={displayOptions}
                    labels={labels}
                    pricing={pricing}
                    dotColor={primaryColor}
                    perPage={1}
                    flexVal={1}
                    activeDevice={activeDevice}
                    bundleType={bundleType}
                    discountType={discountType}
                />

                <div
                    style={{
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
                            background: styles.backgroundColor || "#fff",
                            border: `1px solid ${styles.borderColor || "#e5e7eb"}`,
                            textAlign: "center",
                            lineHeight: "28px",
                            fontSize: 16,
                            color: styles.textColor || "#9ca3af",
                        }}
                    >
                        +
                    </div>
                </div>

                <TileSlider
                    products={rewardProducts}
                    variant="reward"
                    styles={styles}
                    displayOptions={displayOptions}
                    labels={labels}
                    pricing={pricing}
                    dotColor={savingsColor}
                    perPage={1}
                    flexVal={1}
                    activeDevice={activeDevice}
                    bundleType={bundleType}
                    discountType={discountType}
                />
            </div>

            {/* Footer */}
            <div
                style={{
                    display: "flex",
                    alignItems: activeDevice === "mobile" ? "normal" : "center",
                    justifyContent: "space-between",
                    padding: `10px ${parseInt(padding)}px ${parseInt(padding)}px`,
                    gap: 12,
                    flexDirection: activeDevice === "mobile" ? "column" : "row",
                }}
            >
                {pricing && (
                    <div
                        style={{
                            display: "flex",
                            flexDirection: "column",
                            gap: "3px",
                        }}
                    >
                        <span
                            style={{
                                fontSize: parseInt(bodyFontSize) - 3,
                                color: styles.textColor || "#6b7280",
                                opacity: 0.7,
                                fontWeight: 500,
                            }}
                        >
                            {labels?.bogoTotalLabel ||
                                PREVIEW_LABELS.bogoTotalLabel}
                        </span>
                        <div
                            style={{
                                display: "flex",
                                alignItems: "baseline",
                                gap: 6,
                            }}
                        >
                            <span
                                style={{
                                    fontSize: headingFontSize,
                                    fontWeight: 600,
                                    color: styles.textColor,
                                }}
                            >
                                {pricing.finalPrice}
                            </span>
                            {pricing.hasDiscount && displayOptions.showSavings && (
                                <span
                                    style={{
                                        fontSize: parseInt(bodyFontSize) - 2,
                                        fontWeight: 500,
                                        color: savingsColor,
                                    }}
                                >
                                    {(
                                        labels?.bogoSaveText ||
                                        DEFAULT_LABELS.bogoSaveText
                                    ).replace(
                                        "{amount}",
                                        pricing.savingsAmount || "",
                                    )}
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
                            border: isButtonOutline
                                ? `2px solid ${buttonBg}`
                                : "none",
                            borderRadius: getButtonRadius(styles.cornerStyle),
                            background: isButtonOutline
                                ? "transparent"
                                : buttonBg,
                            color: isButtonOutline ? buttonBg : "#fff",
                            fontSize: getButtonFontSize(styles.buttonSize),
                            fontWeight: 600,
                            cursor: "pointer",
                            whiteSpace: "nowrap",
                        }}
                    >
                        {cartButtonText || PREVIEW_LABELS.addToCartText}
                    </button>
                )}
            </div>
        </div>
    );
}
