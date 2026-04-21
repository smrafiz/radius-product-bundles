"use client";

import {
    type VolumeLayoutProps,
    getCardBgColor,
    getCardRadius,
    getFontSize,
    getImageSize,
    getShadow,
    getSpacing,
    PLACEHOLDER_IMAGES,
} from "@/features/settings";
import { useCallback, useState } from "react";

import "@/styles/components/volume-preview.css";
import { PREVIEW_LABELS } from "@/shared";

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

export function VolumePricingCards({
    tiers,
    product,
    styles,
    displayOptions,
    labels,
}: VolumeLayoutProps) {
    const defaultIndex = tiers.findIndex((t) => t.isDefault);
    const [selectedIndex, setSelectedIndex] = useState<number>(
        defaultIndex >= 0 ? defaultIndex : 0,
    );

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
                            {product.title}
                        </span>
                        <span className="rb-vol__product-base-price">
                            {product.basePrice} / {labels?.volumeUnitLabel || PREVIEW_LABELS.volumeUnitLabel}
                        </span>
                    </div>
                </div>
            )}

            <ul
                className="rb-vol__cards-grid"
                role="list"
                aria-label="Volume discount tiers"
            >
                {tiers.map((tier, i) => {
                    const isSelected = i === selectedIndex;
                    const isLast = i === tiers.length - 1;
                    const qtyLabel = !isLast
                        ? `Buy ${tier.qty}+`
                        : `Buy ${tier.qty}`;
                    const resolvedTitle =
                        tier.title ||
                        (i === 0
                            ? "Standard"
                            : i === 1
                              ? "Value Pack"
                              : i === 2
                                ? "Bulk Deal"
                                : `Tier ${i + 1}`);
                    const subtitleText =
                        tier.subtitle || `Buy ${qtyLabel} Units`;
                    const hasBadge = !!tier.badge?.text;

                    return (
                        <li
                            key={i}
                            className={[
                                "rb-vol__tier",
                                "rb-vol__card",
                                hasBadge ? "rb-vol__card--popular" : "",
                                isSelected ? "rb-vol__tier--selected" : "",
                            ]
                                .filter(Boolean)
                                .join(" ")}
                            role="button"
                            tabIndex={0}
                            aria-pressed={isSelected}
                            aria-label={`${resolvedTitle}, ${subtitleText}${tier.savings ? `, ${tier.savings}` : ""}${tier.badge?.text ? `, ${tier.badge.text}` : ""}`}
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
                            {hasBadge && (
                                <div
                                    className={`rb-vol__card-popular-badge ${badgeClass(tier.badge?.style)}`}
                                    aria-hidden="true"
                                >
                                    {tier.badge!.text.toUpperCase()}
                                </div>
                            )}

                            <div className="rb-vol__card-title">
                                {resolvedTitle}
                            </div>
                            <div className="rb-vol__card-subtitle">
                                {subtitleText}
                            </div>

                            {tier.price && displayOptions?.showPrices && (
                                <div className="rb-vol__card-price">
                                    {tier.price}
                                </div>
                            )}

                            {tier.savings && displayOptions?.showSavings && (
                                <div className="rb-vol__card-savings">
                                    {tier.savings.toUpperCase()}
                                </div>
                            )}

                            <button
                                className="rb-vol__card-select-btn"
                                tabIndex={-1}
                                aria-hidden="true"
                            >
                                {isSelected ? "Applied" : "Select"}
                            </button>
                        </li>
                    );
                })}
            </ul>
        </div>
    );
}
