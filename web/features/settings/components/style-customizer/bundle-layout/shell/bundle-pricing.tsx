"use client";

import { DEFAULT_LABELS } from "@/features/settings/constants/defaults.constants";
import { getCardRadius, getFontSize, useCustomizerStore, } from "@/features/settings";

/**
 * Bundle pricing summary display.
 *
 * Respects these customizer settings:
 * - pricingSummaryBox: Show/hide the box container styling
 * - pricingSummaryBg: Background color of the box
 * - pricingSummaryStyle: minimal | card | highlight
 * - bodySize: Font size preset
 * - textColor, primaryColor, savingsColor, borderColor
 * - cornerStyle: For border radius
 */
export function BundlePricing() {
    const { styles } = useCustomizerStore();
    const showSummaryBox = styles.pricingSummaryBox;

    const fontSize = getFontSize(styles.bodySize);
    const borderRadius = getCardRadius(styles.cornerStyle);

    const textColor = styles.textColor || "#333333";
    const highlightColor = styles.primaryColor || "#303030";
    const savingsColor = styles.savingsColor || "#16a34a";
    const borderColor = styles.borderColor || "#e5e7eb";
    const summaryBg = styles.pricingSummaryBg || "#f9fafb";

    /**
     * Gets container styles based on pricingSummaryBox and pricingSummaryStyle.
     */
    const getContainerStyles = (): React.CSSProperties => {
        // If box is disabled, return plain styling (no background, no border, no special padding)
        if (!styles.pricingSummaryBox) {
            return {
                padding: "8px 0",
                backgroundColor: "transparent",
                border: "none",
                borderRadius: 0,
            };
        }

        // Box is enabled - apply style based on pricingSummaryStyle
        switch (styles.pricingSummaryStyle) {
            case "minimal":
                return {
                    padding: "16px 0",
                    borderTop: `1px solid ${borderColor}`,
                    backgroundColor: "transparent",
                    borderRadius: 0,
                };
            case "card":
                return {
                    backgroundColor: summaryBg,
                    borderRadius,
                    padding: "16px",
                    border: `1px solid ${borderColor}`,
                };
            case "highlight":
                return {
                    backgroundColor: summaryBg,
                    borderRadius,
                    padding: "16px",
                    borderLeft: `4px solid ${highlightColor}`,
                };
            default:
                return {
                    backgroundColor: summaryBg,
                    borderRadius,
                    padding: "16px",
                };
        }
    };

    if (!showSummaryBox) {
        return null;
    }

    return (
        <div
            className="radius-bundle__pricing"
            style={{
                fontSize,
                color: textColor,
                ...getContainerStyles(),
            }}
        >
            {/* Regular price */}
            <div
                className="radius-bundle__pricing-row"
                style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: "8px",
                }}
            >
                <span className="radius-bundle__pricing-label">
                    {DEFAULT_LABELS.regularPriceLabel}
                </span>
                <span
                    className="radius-bundle__price-original"
                    style={{ textDecoration: "line-through", opacity: 0.7 }}
                >
                    $2,899.96
                </span>
            </div>

            {/* Bundle discounted price */}
            <div
                className="radius-bundle__pricing-row radius-bundle__pricing-row--highlight"
                style={{
                    display: "flex",
                    justifyContent: "space-between",
                    color: highlightColor,
                    fontWeight: 600,
                    marginBottom: "8px",
                }}
            >
                <span className="radius-bundle__pricing-label">
                    {DEFAULT_LABELS.bundlePriceLabel}
                </span>
                <span className="radius-bundle__price-discounted">
                    $1,899.96
                </span>
            </div>

            {/* Savings */}
            <div
                className="radius-bundle__pricing-row radius-bundle__savings"
                style={{
                    display: "flex",
                    justifyContent: "space-between",
                    color: savingsColor,
                    fontWeight: 600,
                    marginBottom: "8px",
                }}
            >
                <span className="radius-bundle__savings-label">
                    {DEFAULT_LABELS.youSaveLabel}
                </span>
                <span className="radius-bundle__savings-amount">
                    $474.99 (20%)
                </span>
            </div>

            {/* Free shipping badge */}
            <div
                className="radius-bundle__free-shipping"
                style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "4px",
                    marginTop: "4px",
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
                <span>{DEFAULT_LABELS.freeShippingLabel}</span>
            </div>
        </div>
    );
}
