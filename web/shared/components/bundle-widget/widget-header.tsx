"use client";

import { WidgetHeaderProps } from "@/shared";
import { getBadgeRadius, getHeadingFontSize } from "@/features/settings";
import { DEFAULT_LABELS } from "@/features/settings/constants/defaults.constants";

export function WidgetHeader({
    styles,
    displayOptions,
    pricing,
    title,
}: WidgetHeaderProps) {
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
                borderColor: styles.borderColor,
                flexDirection:
                    styles.badgePosition === "top-left"
                        ? "row-reverse"
                        : undefined,
                justifyContent: isInline ? "flex-start" : "space-between",
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
                    {title || DEFAULT_LABELS.headingLabel}
                </div>
            </div>

            {displayOptions.showSavingsBadge && pricing.hasDiscount && (
                <div
                    className="radius-bundle__actions"
                    style={{ alignSelf: isInline ? "center" : undefined }}
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
                            border: isOutline
                                ? `2px solid ${accentColor}`
                                : "none",
                        }}
                    >
                        Save {pricing.savingsPercentage}%
                    </span>
                </div>
            )}
        </div>
    );
}
