import { useId } from "react";
import { ChartTitleTooltipProps } from "@/features/analytics";

export function ChartTitleTooltip({
    children,
    content,
    title,
    description,
    formula,
    id,
}: ChartTitleTooltipProps) {
    const autoId = useId();
    const tooltipId = id || `info-tooltip-${autoId}`;

    const tooltipContent = content ?? (
        <s-stack gap="small-300">
            {title && <s-heading>{title}</s-heading>}

            {description && (
                <s-paragraph>
                    <span className="text-(length:--p-font-size-300)">
                        {description}
                    </span>
                </s-paragraph>
            )}

            {formula && (
                <s-text tone="info">
                    <span className="font-mono text-(--p-color-text-success-secondary) text-(length:--p-font-size-275) font-normal leading-relaxed">
                        {formula}
                    </span>
                </s-text>
            )}
        </s-stack>
    );

    return (
        <>
            <s-clickable commandFor={tooltipId}>
                <s-heading>
                    <span
                        style={{
                            borderBottom:
                                ".125rem dotted var(--p-color-border-tertiary)",
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
