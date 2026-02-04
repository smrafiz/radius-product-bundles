"use client";

import { DEFAULT_LABELS } from "@/features/settings/constants/defaults.constants";
import { getBadgeRadius, getHeadingFontSize, useEffectiveStyles, } from "@/features/settings";

/**
 * Bundle header with title and savings badge.
 */
export function BundleHeader() {
    const styles = useEffectiveStyles();

    const headingFontSize = getHeadingFontSize(styles.headingSize);
    const badgeRadius = getBadgeRadius(styles.cornerStyle);

    const accentColor = styles.primaryColor || "#303030";
    const textColor = styles.textColor || "#333333";

    const isOutline = styles.badgeStyle === "outline";
    const isInline = styles.badgePosition === "inline";

    return (
        <div
            className="radius-bundle__header"
            style={{
                display: "flex",
                alignItems: "center",
                flexWrap: "wrap",
                gap: "20px",
                flexDirection:
                    styles.badgePosition === "top-left" ? "row-reverse" : undefined,
                justifyContent:
                    styles.badgePosition === "inline"
                        ? "flex-start"
                        : "space-between",
            }}
        >
            <div className="radius-bundle__title-wrapper">
                <div
                    className="radius-bundle__title"
                    style={{
                        fontSize: headingFontSize,
                        color: textColor,
                        fontWeight: 600,
                    }}
                >
                    {DEFAULT_LABELS.headingLabel}
                </div>
            </div>

            {/* Savings Badge */}
            <div
                className="radius-bundle__actions"
                style={{
                    alignSelf: isInline ? "center" : undefined,
                }}
            >
                <span
                    className="radius-bundle__badge"
                    style={{
                        display: "inline-block",
                        borderRadius: badgeRadius,
                        padding: "6px 10px",
                        fontSize: "14px",
                        fontWeight: 600,
                        backgroundColor: isOutline
                            ? "transparent"
                            : accentColor,
                        color: isOutline ? accentColor : "#ffffff",
                        border: isOutline ? `2px solid ${accentColor}` : "none",
                    }}
                >
                    Save 50%
                </span>
            </div>
        </div>
    );
}
