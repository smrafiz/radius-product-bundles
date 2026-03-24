"use client";

import { useTranslations } from "@/lib/i18n/provider";

/**
 * Section header component with title and optional tooltip.
 */
export function SectionHeader({
    id,
    title,
    tooltip,
    tabId,
}: {
    id: string;
    title: string;
    tooltip?: string;
    tabId: string;
}) {
    const tooltipId = `${id}-tooltip`;
    const t = useTranslations("Settings.Tabs");
    const sectionTitleKey = `${tabId}.Sections.${id}.title`;
    const sectionTooltipKey = `${tabId}.Sections.${id}.tooltip`;

    return (
        <s-stack
            direction="inline"
            justifyContent="space-between"
            alignItems="center"
        >
            <s-heading>{t(sectionTitleKey, undefined, title)}</s-heading>
            {tooltip && (
                <>
                    <s-tooltip id={tooltipId}>
                        <s-text>
                            {t(sectionTooltipKey, undefined, tooltip)}
                        </s-text>
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
