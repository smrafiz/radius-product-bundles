"use client";

import {
    getCardBgColor,
    getCardRadius,
    getFontSize,
    getImageSize,
    getShadow,
    getSpacing,
    PLACEHOLDER_IMAGES,
    type VolumeLayoutProps,
    type VolumeLayoutTier,
} from "@/features/settings";
import { useCallback, useState } from "react";

import "@/styles/components/volume-preview.css";
import { PREVIEW_LABELS } from "@/shared";

function parseCurrencyPrefix(priceStr: string): string {
    const match = priceStr.match(/^[^0-9]*/);
    return match ? match[0] : "$";
}

function parsePriceValue(priceStr: string): number {
    return parseFloat(priceStr.replace(/[^0-9.]/g, "")) || 0;
}

function formatPrice(prefix: string, value: number): string {
    return `${prefix}${value.toFixed(2)}`;
}

function activeTierForQty(
    qty: number,
    tiers: ReadonlyArray<VolumeLayoutTier>,
): VolumeLayoutTier | null {
    let best: VolumeLayoutTier | null = null;
    for (const t of tiers) {
        if (qty >= t.qty) best = t;
    }
    return best;
}

function nextTierForQty(
    qty: number,
    tiers: ReadonlyArray<VolumeLayoutTier>,
): VolumeLayoutTier | null {
    for (const t of tiers) {
        if (qty < t.qty) return t;
    }
    return null;
}

function tierSavingsBadgeText(tier: VolumeLayoutTier): string {
    return `Save ${Math.round(tier.discount)}%`;
}

export function VolumeSlider({ tiers, product, styles, displayOptions, labels }: VolumeLayoutProps) {
    const firstTier = tiers[0];
    const initQty = firstTier?.qty ?? 1;

    const lastQty = tiers[tiers.length - 1]?.qty ?? 10;
    const sliderMax = Math.min(100, Math.round(lastQty * 1.5));

    const [qty, setQty] = useState<number>(initQty);

    const basePrice = product?.basePrice ?? "$30.00";
    const currencyPrefix = parseCurrencyPrefix(basePrice);
    const unitPrice = parsePriceValue(basePrice);

    const activeTier = activeTierForQty(qty, tiers);
    const discountedUnit = activeTier
        ? unitPrice * (1 - activeTier.discount / 100)
        : unitPrice;
    const total = discountedUnit * qty;
    const origTotal = unitPrice * qty;
    const savingsAmt = origTotal - total;
    const hasSavings = activeTier !== null && savingsAmt > 0.001;

    const nextTier = nextTierForQty(qty, tiers);
    const nudgeVisible = true; // always render nudge block, control content

    const fillPct =
        sliderMax > 1 ? Math.round(((qty - 1) / (sliderMax - 1)) * 100) : 100;

    let nudgeMsg: string;
    let nudgeBarPct: number;
    if (nextTier) {
        const more = nextTier.qty - qty;
        nudgeMsg = `Add ${more} more to save ${Math.round(nextTier.discount)}%!`;
        const tierIdx = tiers.indexOf(nextTier);
        const prevMin = tierIdx > 0 ? tiers[tierIdx - 1]!.qty : 1;
        nudgeBarPct = Math.min(
            100,
            Math.round(((qty - prevMin) / (nextTier.qty - prevMin)) * 100),
        );
    } else {
        nudgeMsg = "Maximum discount applied!";
        nudgeBarPct = 100;
    }

    const handleSliderChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            setQty(parseInt(e.target.value, 10) || 1);
        },
        [],
    );

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
        "--rb-image-fit": styles.imageFit || "cover",
        "--rb-button-bg-color": styles.buttonBgColor || styles.primaryColor,
        "--rb-slider-fill-pct": `${fillPct}%`,
    } as React.CSSProperties;

    return (
        <div className="rb-vol-slider__wrap" style={cssVars}>
            {displayOptions?.showImages && (
                <div className="rb-vol-slider__hero-image">
                    {imageEl}
                    <div
                        className="rb-vol-slider__savings-badge"
                        style={{ display: hasSavings ? undefined : "none" }}
                    >
                        {hasSavings && activeTier
                            ? tierSavingsBadgeText(activeTier)
                            : ""}
                    </div>
                </div>
            )}

            <div className="rb-vol-slider__product-title">
                {product?.title ?? "Product"}
            </div>

            {unitPrice > 0 && (
                <div className="rb-vol-slider__price-box">
                    <div className="rb-vol-slider__price-left">
                        <span className="rb-vol-slider__price-total">
                            {formatPrice(currencyPrefix, total)}
                        </span>
                        <span className="rb-vol-slider__price-unit">
                            {formatPrice(currencyPrefix, discountedUnit)} / unit
                        </span>
                        <span
                            className="rb-vol-slider__price-original"
                            style={{ display: hasSavings ? undefined : "none" }}
                        >
                            {formatPrice(currencyPrefix, origTotal)}
                        </span>
                    </div>

                    {displayOptions?.showSavings && (
                    <div
                        className="rb-vol-slider__price-savings"
                        style={{ display: hasSavings ? undefined : "none" }}
                    >
                        <span
                            className="rb-vol-slider__price-savings-amount"
                            style={{
                                color: `var(--rb-savings-color, #16a34a)`,
                            }}
                        >
                            -{formatPrice(currencyPrefix, savingsAmt)}
                        </span>
                        <span className="rb-vol-slider__price-savings-label">
                            {labels?.volumeYouSaveLabel || PREVIEW_LABELS.volumeYouSaveLabel}
                        </span>
                    </div>
                    )}
                </div>
            )}

            {displayOptions?.showQuantity && (
            <div className="rb-vol-slider__slider-section">
                <div className="rb-vol-slider__slider-header">
                    <span className="rb-vol-slider__qty-label">
                        {labels?.volumeSelectQuantityLabel || PREVIEW_LABELS.volumeSelectQuantityLabel}
                    </span>
                    <span className="rb-vol-slider__qty-counter">
                        {qty} {labels?.volumeUnitsLabel || PREVIEW_LABELS.volumeUnitsLabel}
                    </span>
                </div>

                <input
                    className="rb-vol-slider__slider-track"
                    type="range"
                    min={1}
                    max={sliderMax}
                    value={qty}
                    step={1}
                    aria-label="Select quantity"
                    aria-valuemin={1}
                    aria-valuemax={sliderMax}
                    aria-valuenow={qty}
                    onChange={handleSliderChange}
                />

                <div
                    className="rb-vol-slider__slider-markers"
                    aria-hidden="true"
                >
                    {tiers.map((tier, i) => {
                        const pct =
                            sliderMax > 1
                                ? ((tier.qty - 1) / (sliderMax - 1)) * 100
                                : 0;
                        return (
                            <span
                                key={i}
                                className="rb-vol-slider__marker"
                                style={{ left: `${pct.toFixed(2)}%` }}
                                data-marker-qty={tier.qty}
                            />
                        );
                    })}
                </div>
            </div>
            )}

            {nudgeVisible && (
                <div className="rb-vol-slider__nudge">
                    <div className="rb-vol-slider__nudge-header">
                        <svg
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            aria-hidden="true"
                        >
                            <path d="M20 12v6a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-6" />
                            <polyline points="16 6 12 2 8 6" />
                            <line x1="12" y1="2" x2="12" y2="15" />
                        </svg>
                        <span className="rb-vol-slider__nudge-text">
                            {nudgeMsg}
                        </span>
                    </div>
                    <div className="rb-vol-slider__nudge-bar">
                        <div
                            className="rb-vol-slider__nudge-fill"
                            style={{ width: `${nudgeBarPct}%` }}
                        />
                    </div>
                </div>
            )}
        </div>
    );
}
