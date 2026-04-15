"use client";

import {
    type VolumeLayoutProps,
    type VolumeLayoutTier,
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

function pillLabel(tier: VolumeLayoutTier): string {
    return `${tier.qty}+ (-${Math.round(tier.discount)}%)`;
}

export function VolumeCalculator({
    tiers,
    product,
    styles,
    displayOptions,
    labels,
}: VolumeLayoutProps) {
    const [qty, setQty] = useState<number>(1);

    const basePrice = product?.basePrice ?? "$30.00";
    const currencyPrefix = parseCurrencyPrefix(basePrice);
    const unitPrice = parsePriceValue(basePrice);

    const activeTier = activeTierForQty(qty, tiers);
    const discountedUnit = activeTier
        ? unitPrice * (1 - activeTier.discount / 100)
        : unitPrice;
    const total = discountedUnit * qty;
    const origTotal = unitPrice * qty;
    const savings = origTotal - total;
    const hasSavings = activeTier !== null && savings > 0.001;

    const activePillIndex = activeTier ? tiers.indexOf(activeTier) : -1;

    const decrement = useCallback(() => {
        setQty((q) => Math.max(1, q - 1));
    }, []);

    const increment = useCallback(() => {
        setQty((q) => q + 1);
    }, []);

    const handleInputChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            const v = parseInt(e.target.value, 10);
            if (!isNaN(v) && v >= 1) setQty(v);
        },
        [],
    );

    const handlePillClick = useCallback((tierQty: number) => {
        setQty(tierQty);
    }, []);

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
    } as React.CSSProperties;

    return (
        <div className="rb-vol-calc__wrap" style={cssVars}>
            {displayOptions?.showImages && (
                <div className="rb-vol-calc__hero-image">
                    {imageEl}
                </div>
            )}

            <div className="rb-vol-calc__product-title">
                {product?.title ?? "Product"}
            </div>

            {displayOptions?.showQuantity && (
            <div className="rb-vol-calc__qty-section">
                <label
                    className="rb-vol-calc__qty-label"
                    htmlFor="rb-calc-qty-input"
                >
                    {labels?.volumeSelectQuantityLabel || PREVIEW_LABELS.volumeSelectQuantityLabel}
                </label>
                <div className="rb-vol-calc__qty-wrap">
                    <button
                        className="rb-vol-calc__qty-btn"
                        type="button"
                        aria-label="Decrease quantity"
                        onClick={decrement}
                    >
                        −
                    </button>
                    <input
                        className="rb-vol-calc__qty-input"
                        id="rb-calc-qty-input"
                        type="number"
                        min={1}
                        value={qty}
                        step={1}
                        onChange={handleInputChange}
                    />
                    <button
                        className="rb-vol-calc__qty-btn"
                        type="button"
                        aria-label="Increase quantity"
                        onClick={increment}
                    >
                        +
                    </button>
                </div>
            </div>
            )}

            {unitPrice > 0 && (
                <div className="rb-vol-calc__calc-row" data-calc-total="">
                    <span className="rb-vol-calc__calc-label">{labels?.volumeTotalCostLabel || PREVIEW_LABELS.volumeTotalCostLabel}</span>
                    <div className="rb-vol-calc__calc-value-wrap">
                        <span
                            className="rb-vol-calc__calc-value"
                            style={{
                                color: `var(--rb-primary-color, #303030)`,
                            }}
                        >
                            {formatPrice(currencyPrefix, total)}
                        </span>
                    </div>
                </div>
            )}

            {unitPrice > 0 && displayOptions?.showSavings && (
                <div
                    className="rb-vol-calc__calc-row rb-vol-calc__calc-row--savings"
                    style={{ display: hasSavings ? undefined : "none" }}
                >
                    <span className="rb-vol-calc__calc-label">{labels?.volumeYouSaveLabel || PREVIEW_LABELS.volumeYouSaveLabel}</span>
                    <div className="rb-vol-calc__calc-value-wrap">
                        <span
                            className="rb-vol-calc__calc-value"
                            style={{
                                color: `var(--rb-savings-color, #16a34a)`,
                            }}
                        >
                            {formatPrice(currencyPrefix, savings)}
                        </span>
                        <span className="rb-vol-calc__calc-sub">
                            <s>{formatPrice(currencyPrefix, origTotal)}</s>
                        </span>
                    </div>
                </div>
            )}

            {unitPrice > 0 && (
                <div
                    className="rb-vol-calc__calc-row"
                    data-calc-cpu=""
                    style={{ display: hasSavings ? undefined : "none" }}
                >
                    <span className="rb-vol-calc__calc-label">
                        {labels?.volumeCostPerUnitLabel || PREVIEW_LABELS.volumeCostPerUnitLabel}
                    </span>
                    <div className="rb-vol-calc__calc-value-wrap">
                        <span className="rb-vol-calc__calc-value">
                            {formatPrice(currencyPrefix, discountedUnit)}
                        </span>
                        <span className="rb-vol-calc__calc-sub">
                            {labels?.volumeRegularPriceLabel || PREVIEW_LABELS.volumeRegularPriceLabel}{" "}
                            <s>{formatPrice(currencyPrefix, unitPrice)}</s>
                        </span>
                    </div>
                </div>
            )}

            <div
                className="rb-vol-calc__pills"
                role="group"
                aria-label="Quantity discount tiers"
            >
                {tiers.map((tier, i) => {
                    const isActive = i === activePillIndex;
                    const label = pillLabel(tier);
                    return (
                        <button
                            key={i}
                            className={`rb-vol-calc__pill${isActive ? " rb-vol-calc__pill--active" : ""}`}
                            type="button"
                            aria-pressed={isActive}
                            aria-label={label}
                            onClick={() => handlePillClick(tier.qty)}
                        >
                            {label}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
