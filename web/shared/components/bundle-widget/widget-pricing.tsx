"use client";

import { WidgetPricingProps } from "@/shared";
import { getCardRadius, getFontSize, getSpacing } from "@/features/settings";
import { PREVIEW_LABELS } from "@/shared/constants/bundle-widget.constants";

export function WidgetPricingDisplay({
    styles,
    displayOptions,
    pricing,
    hideOriginalPrice,
    labels,
}: WidgetPricingProps) {
    const fontSize = getFontSize(styles.bodySize);
    const borderRadius = getCardRadius(styles.cornerStyle);
    const padding = getSpacing(styles.spacing);

    const textColor = styles.textColor || "#333333";
    const highlightColor = styles.primaryColor || "#303030";
    const savingsColor = styles.savingsColor || "#16a34a";
    const borderColor = styles.borderColor || "#e5e7eb";
    const summaryBg = styles.pricingSummaryBg || "#f9fafb";

    const getContainerStyles = (): React.CSSProperties => {
        if (!styles.pricingSummaryBox) {
            return {
                padding: "8px 0",
                backgroundColor: "transparent",
                border: "none",
                borderRadius: 0,
            };
        }

        switch (styles.pricingSummaryStyle) {
            case "minimal":
                return {
                    padding: "16px 0",
                    backgroundColor: "transparent",
                    borderRadius: 0,
                };
            case "card":
                return {
                    backgroundColor: summaryBg,
                    borderRadius,
                    padding,
                    border: `1px solid ${borderColor}`,
                };
            case "highlight":
                return {
                    backgroundColor: summaryBg,
                    borderRadius,
                    padding,
                    borderLeft: `4px solid ${highlightColor}`,
                };
            default:
                return {
                    backgroundColor: summaryBg,
                    borderRadius,
                    padding,
                };
        }
    };

    if (!styles.pricingSummaryBox) {
        return null;
    }

    return (
        <div
            className="radius-bundle__pricing"
            style={{ fontSize, color: textColor, ...getContainerStyles() }}
        >
            {!hideOriginalPrice && (
                <div
                    className="radius-bundle__pricing-row"
                    style={{
                        display: "flex",
                        justifyContent: "space-between",
                        marginBottom: "8px",
                    }}
                >
                    <span className="radius-bundle__pricing-label">
                        {labels?.regularPriceLabel || PREVIEW_LABELS.regularPriceLabel}
                    </span>
                    <span
                        className="radius-bundle__price-original"
                        style={{ textDecoration: "line-through", opacity: 0.7 }}
                    >
                        {pricing.originalPrice}
                    </span>
                </div>
            )}

            <div
                className={`radius-bundle__pricing-row radius-bundle__pricing-row--highlight`}
                style={{
                    display: "flex",
                    justifyContent: "space-between",
                    color: highlightColor,
                    marginBottom: "10px",
                    padding: "10px 0",
                    borderTop: !hideOriginalPrice ? `1px dashed ${borderColor}` : "",
                    borderBottom: `1px dashed ${borderColor}`,
                }}
            >
                <span className="radius-bundle__pricing-label">
                    {labels?.bundlePriceLabel || PREVIEW_LABELS.bundlePriceLabel}
                </span>
                <span className="radius-bundle__price-discounted">
                    {pricing.finalPrice}
                </span>
            </div>

            {displayOptions.showSavings && pricing.hasDiscount && (
                <div
                    className="radius-bundle__pricing-row radius-bundle__savings"
                    style={{
                        display: "flex",
                        justifyContent: "space-between",
                        color: savingsColor,
                        marginBottom: "8px",
                        borderRadius: borderRadius,
                        background: `color-mix(in srgb, ${savingsColor} 15%, transparent)`,
                        padding,
                    }}
                >
                    <span className="radius-bundle__savings-label">
                        {labels?.youSaveLabel || PREVIEW_LABELS.youSaveLabel}
                    </span>
                    <span className="radius-bundle__savings-amount">
                        {pricing.savingsAmount} ({pricing.savingsPercentage}%)
                    </span>
                </div>
            )}

            {displayOptions.showFreeShipping && !hideOriginalPrice && (
                <div
                    className="radius-bundle__free-shipping"
                    style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "4px",
                        marginTop: "8px",
                        borderRadius: borderRadius,
                        padding,
                    }}
                >
                    <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                    >
                        <path d="M5 18H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h3.93a2 2 0 0 1 1.66.9l.82 1.2a2 2 0 0 0 1.66.9H21a2 2 0 0 1 2 2v1" />
                        <circle cx="7" cy="18" r="2" />
                        <circle cx="17" cy="18" r="2" />
                    </svg>
                    <span>{labels?.freeShippingLabel || PREVIEW_LABELS.freeShippingLabel}</span>
                </div>
            )}
        </div>
    );
}
