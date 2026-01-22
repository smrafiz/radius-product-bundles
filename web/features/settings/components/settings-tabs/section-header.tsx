"use client";

/**
 * Section header component with title and optional tooltip.
 */
export function SectionHeader({
    id,
    title,
    tooltip,
}: {
    id: string;
    title: string;
    tooltip?: string;
}) {
    const tooltipId = `${id}-tooltip`;

    return (
        <s-stack
            direction="inline"
            justifyContent="space-between"
            alignItems="center"
        >
            <s-heading>{title}</s-heading>
            {tooltip && (
                <>
                    <s-tooltip id={tooltipId}>
                        <s-text>{tooltip}</s-text>
                    </s-tooltip>
                    <s-icon
                        tone="neutral"
                        type="info"
                        interestFor={tooltipId}
                    />
                </>
            )}
        </s-stack>
    );
}
