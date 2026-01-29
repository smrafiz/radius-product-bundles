"use client";

import { DEFAULT_LABELS, useCustomizerStore } from "@/features/settings";

/**
 * Bundle pricing display
 */
export function BundlePricing() {
    const { styles } = useCustomizerStore();

    // Font sizing based on body size token
    const fontSizeMap: Record<string, string> = {
        small: "14px",
        medium: "16px",
        large: "18px",
    };
    const fontSize = fontSizeMap[styles.bodySize ?? "medium"];

    const textColor = styles.textColor || "#333333";
    const highlightColor = styles.primaryColor || "#303030";
    const savingsColor = styles.savingsColor || "#16a34a";

    return (
        <div
            className="radius-bundle__pricing"
            style={{ fontSize, color: textColor }}
        >
            {/* Regular price */}
            <div className="radius-bundle__pricing-row">
                <span className="radius-bundle__pricing-label">
                    {DEFAULT_LABELS.regularPriceLabel}
                </span>
                <span className="radius-bundle__price-original">$2,899.96</span>
            </div>

            {/* Bundle discounted price */}
            <div
                className="radius-bundle__pricing-row radius-bundle__pricing-row--highlight"
                style={{ color: highlightColor, fontWeight: 600 }}
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
                style={{ color: savingsColor, fontWeight: 600 }}
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
                className="radius-bundle__free-shipping flex items-center gap-1 mt-1 text-xs"
                style={{ color: highlightColor }}
            >
                <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    className="inline-block"
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
