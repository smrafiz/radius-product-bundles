"use client";

import { useTranslations } from "@/lib/i18n/provider";
import { useWidgetStatus } from "@/features/dashboard";
import { useEffect } from "react";

/**
 * Unified integration status banner.
 */
export function WidgetStatusBanner({
    shopDomain,
    apiKey,
    setupGuideVisible,
    forceRecheck = false,
}: {
    shopDomain: string;
    apiKey: string;
    setupGuideVisible: boolean;
    forceRecheck?: boolean;
}) {
    const tEmbed = useTranslations("Dashboard.AppEmbed");
    const tWidget = useTranslations("Dashboard.WidgetBlock");
    const tBoth = useTranslations("Dashboard.Integration");

    const { hasAppEmbed, hasWidgetBlock, isChecking, themeEditorUrl, recheck } =
        useWidgetStatus({ shopDomain, apiKey });

    // Force recheck on mount if requested (for bundle creation page)
    useEffect(() => {
        if (forceRecheck) {
            recheck();
        }
    }, [forceRecheck, recheck]);

    if (setupGuideVisible || isChecking) {
        return null;
    }

    const embedMissing = !hasAppEmbed;
    const blockMissing = !hasWidgetBlock;

    if (!embedMissing && !blockMissing) {
        return null;
    }

    const bothMissing = embedMissing && blockMissing;

    const heading = bothMissing
        ? tBoth("setupIncomplete")
        : embedMissing
          ? tEmbed("notEnabled")
          : tWidget("notAdded");

    const description = bothMissing
        ? tBoth("bothMissingDesc")
        : embedMissing
          ? tEmbed("notEnabledDesc")
          : tWidget("notAddedDesc");

    const embedUrl = `https://${shopDomain}/admin/themes/current/editor?context=apps&activateAppId=${apiKey}/app-embed`;

    return (
        <s-banner tone="warning" heading={heading}>
            <s-paragraph>{description}</s-paragraph>
            {embedMissing && (
                <s-button
                    slot="secondary-actions"
                    variant="secondary"
                    onClick={() => Object.assign(document.createElement("a"), { href: embedUrl, target: "_blank", rel: "noopener noreferrer" }).click()}
                >
                    {bothMissing ? tBoth("enableEmbed") : tEmbed("enableButton")}
                </s-button>
            )}
            {blockMissing && themeEditorUrl && (
                <s-button
                    slot="secondary-actions"
                    variant="secondary"
                    onClick={() => window.open(themeEditorUrl, "_blank")}
                >
                    {bothMissing ? tBoth("addWidget") : tWidget("addButton")}
                </s-button>
            )}
        </s-banner>
    );
}
