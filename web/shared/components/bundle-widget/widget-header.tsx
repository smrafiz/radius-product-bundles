"use client";

import { WidgetHeaderProps } from "@/shared";
import {
    getBadgeRadius,
    getFontSize,
    getHeadingFontSize,
} from "@/features/settings";
import { useTranslations } from "@/lib/i18n/provider";

export function WidgetHeader({
    styles,
    displayOptions,
    pricing,
    title,
    subtitle,
    labels,
    badgeText,
}: WidgetHeaderProps) {
    const t = useTranslations("Bundles.Creation.Preview");
    const headingFontSize = getHeadingFontSize(styles.headingSize);
    const badgeRadius = getBadgeRadius(styles.cornerStyle);

    const accentColor = styles.primaryColor || "#303030";
    const textColor = styles.textColor || "#333333";
    const isOutline = styles.badgeStyle === "outline";
    const isInline = styles.badgePosition === "inline";
    const bodyFontSize = getFontSize(styles.bodySize);

    return (
        <div
            className="radius-bundle__header"
            style={{
                display: "flex",
                alignItems: "center",
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
                        lineHeight: 1.3,
                    }}
                >
                    {title || labels?.headingLabel || t("headingLabel")}
                </div>
                {subtitle && (
                    <p
                        className="radius-bundle__subtitle"
                        style={{
                            fontSize: parseInt(bodyFontSize) - 2,
                            color: textColor,
                            opacity: 0.9,
                            fontWeight: 400,
                            margin: "4px 0 0",
                        }}
                    >
                        {subtitle}
                    </p>
                )}
            </div>

            {displayOptions.showSavingsBadge && (badgeText || pricing.hasDiscount) && (
                <div
                    style={{ alignSelf: isInline ? "center" : undefined }}
                >
                    <span
                        className="radius-bundle__badge"
                        aria-label={badgeText ?? t("savingsBadge", { percent: String(pricing.savingsPercentage) })}
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
                        {badgeText ?? t("savingsBadge", { percent: String(pricing.savingsPercentage) })}
                    </span>
                </div>
            )}
        </div>
    );
}
