"use client";

import { useId } from "react";
import { ChartTitleTooltipProps } from "@/features/analytics";
import { useTranslations } from "@/lib/i18n/provider";

export function ChartTitleTooltip({
    children,
    content,
    title,
    description,
    formula,
    id,
}: ChartTitleTooltipProps) {
    const t = useTranslations("Analytics.Charts");
    const autoId = useId();
    const tooltipId = id || `info-tooltip-${autoId}`;

    const tooltipContent = content ?? (
        <s-stack gap="small-300">
            {title && <s-heading>{title}</s-heading>}

            {description && (
                <s-paragraph>
                    <span className="text-[12px]">{description}</span>
                </s-paragraph>
            )}

            {formula && (
                <s-text tone="info">
                    <span className="font-mono text-[#086b5a] text-[11px] font-normal leading-relaxed">
                        {formula}
                    </span>
                </s-text>
            )}
        </s-stack>
    );

    return (
        <>
            <s-clickable
                commandFor={tooltipId}
                accessibilityLabel={
                    typeof children === "string"
                        ? `${children} ${t("moreInfoSuffix")}`
                        : title
                          ? `${title} ${t("moreInfoSuffix")}`
                          : t("moreInfo")
                }
            >
                <s-heading>
                    <span
                        style={{
                            borderBottom: ".125rem dotted #cccccc",
                            cursor: "help",
                            display: "inline-block",
                        }}
                    >
                        {children}
                    </span>
                </s-heading>
            </s-clickable>

            <s-popover id={tooltipId} inlineSize="350px">
                <s-box padding="small">{tooltipContent}</s-box>
            </s-popover>
        </>
    );
}
