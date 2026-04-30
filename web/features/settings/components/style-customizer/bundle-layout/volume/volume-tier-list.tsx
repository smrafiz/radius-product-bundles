"use client";

import {
    getCardBgColor,
    getCardRadius,
    getFontSize,
    getImageSize,
    getShadow,
    getSpacing,
    PLACEHOLDER_IMAGES,
    VolumeLayoutProps,
} from "@/features/settings";
import { useCallback, useEffect, useState } from "react";

import "@/styles/components/volume-preview.css";

function badgeClass(style?: string): string {
    switch (style) {
        case "popular":
            return "rb-vol__tier-badge--popular";
        case "best-value":
            return "rb-vol__tier-badge--best-value";
        case "new":
            return "rb-vol__tier-badge--new";
        default:
            return "rb-vol__tier-badge--default";
    }
}

export function VolumeTierList({ tiers, product, styles, displayOptions, labels }: VolumeLayoutProps) {
    const defaultIndex = tiers.findIndex((t) => t.isDefault);
    const [selectedIndex, setSelectedIndex] = useState<number>(
        defaultIndex >= 0 ? defaultIndex : 0,
    );

    // Re-sync when the merchant changes which tier is pre-selected
    useEffect(() => {
        if (defaultIndex >= 0) {
            setSelectedIndex(defaultIndex);
        }
    }, [defaultIndex]);

    const selectTier = useCallback((i: number) => setSelectedIndex(i), []);

    const imageSrc =
        product?.image && product.image.trim() !== ""
            ? product.image
            : PLACEHOLDER_IMAGES[3];

    const imageEl =
        <img
            src={imageSrc}
            alt={product?.title || "Product"}
            loading="lazy"
            onError={(e) => {
                e.currentTarget.src = PLACEHOLDER_IMAGES[3];
            }}
        />;

    const cssVars = {
        "--rb-primary-color": styles.primaryColor,
        "--rb-border-color": styles.borderColor,
        "--rb-text-color": styles.textColor,
        "--rb-savings-color": styles.savingsColor,
        "--rb-background-color": styles.backgroundColor,
        "--rb-border-radius": getCardRadius(styles.cornerStyle),
        "--rb-body-font-size": getFontSize(styles.bodySize),
        "--rb-gap-spacing": getSpacing(styles.spacing),
        "--rb-shadow": getShadow(styles.shadow),
        "--rb-product-bg-color": getCardBgColor(styles),
        "--rb-image-size": getImageSize(styles.imageSize),
        "--rb-image-fit": styles.imageFit || "contain",
        "--rb-button-bg-color": styles.buttonBgColor || styles.primaryColor,
    } as React.CSSProperties;

    return (
        <div className="rb-vol__wrap" style={cssVars}>
            {product && (
                <div className="rb-vol__product-header">
                    {displayOptions?.showImages && (
                        <div className="rb-vol__product-image">
                            {imageEl}
                        </div>
                    )}

                    <div className="rb-vol__product-meta">
                        <span className="rb-vol__product-title">
                            {product?.title || "Product"}
                        </span>
                        <span className="rb-vol__product-base-price">
                            {product?.basePrice || "0.00"} / {labels?.volumeUnitLabel || "unit"}
                        </span>
                    </div>
                </div>
            )}

            <ul
                className="rb-vol__tiers"
                role="list"
                aria-label="Volume discount tiers"
            >
                {tiers.map((tier, i) => {
                    const isSelected = i === selectedIndex;
                    const isLast = i === tiers.length - 1;
                    const moreTemplate = labels?.volumeBuyUnitsMoreLabel ?? "Buy {qty}+ Units";
                    const exactTemplate = labels?.volumeBuyUnitsLabel ?? "Buy {qty} Units";
                    const qtyLabel = (!isLast
                        ? moreTemplate
                        : exactTemplate
                    ).replace("{qty}", String(tier.qty));
                    const resolvedTitle = tier.title || qtyLabel;

                    return (
                        <li
                            key={i}
                            className={`rb-vol__tier${isSelected ? " rb-vol__tier--selected" : ""}`}
                            role="button"
                            tabIndex={0}
                            aria-pressed={isSelected}
                            aria-label={resolvedTitle}
                            onClick={() => selectTier(i)}
                            onKeyDown={(e) => {
                                if (e.key === "Enter" || e.key === " ") {
                                    e.preventDefault();
                                    selectTier(i);
                                }
                            }}
                            style={{
                                border: styles.productCardBorder
                                    ? isSelected
                                        ? `1px solid ${styles.primaryColor}`
                                        : `1px solid ${styles.borderColor}`
                                    : "none",
                            }}
                        >
                            <div
                                className="rb-vol__tier-radio"
                                aria-hidden="true"
                            >
                                <svg
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="3"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                >
                                    <polyline points="20 6 9 17 4 12" />
                                </svg>
                            </div>

                            <div className="rb-vol__tier-info">
                                <div className="rb-vol__tier-title-row">
                                    <span className="rb-vol__tier-title">
                                        {resolvedTitle}
                                    </span>
                                    {tier.badge?.text && (
                                        <span
                                            className={`rb-vol__tier-badge ${badgeClass(tier.badge.style)}`}
                                        >
                                            {tier.badge.text}
                                        </span>
                                    )}
                                </div>
                                {tier.subtitle && (
                                    <span className="rb-vol__tier-subtitle">
                                        {tier.subtitle}
                                    </span>
                                )}
                                {tier.savings && displayOptions?.showSavings && (
                                    <span className="rb-vol__tier-savings-line">
                                        {tier.savings}
                                    </span>
                                )}
                            </div>

                            {tier.price && displayOptions?.showPrices && (
                                <div className="rb-vol__tier-pricing">
                                    <span className="rb-vol__tier-price">
                                        {tier.price}
                                    </span>
                                    {tier.comparePrice && displayOptions?.showComparePrices && (
                                        <span className="rb-vol__tier-original">
                                            {tier.comparePrice}
                                        </span>
                                    )}
                                </div>
                            )}
                        </li>
                    );
                })}
            </ul>
        </div>
    );
}
