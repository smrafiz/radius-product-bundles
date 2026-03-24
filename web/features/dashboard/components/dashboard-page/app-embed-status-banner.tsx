"use client";

import { useTranslations } from "@/lib/i18n/provider";

/**
 * Persistent warning banner when the app embed is not enabled.
 */
export function AppEmbedStatusBanner({
    dismissed,
    appEmbedEnabled,
    shopDomain,
    apiKey,
}: {
    dismissed: boolean;
    appEmbedEnabled: boolean;
    shopDomain: string;
    apiKey: string;
}) {
    const t = useTranslations("Dashboard.AppEmbed");

    if (!dismissed || appEmbedEnabled) {
        return null;
    }

    const themeEditorUrl = `https://${shopDomain}/admin/themes/current/editor?context=apps&activateAppId=${apiKey}/app-embed`;

    return (
        <s-banner tone="warning" heading={t("notEnabled")}>
            <s-paragraph>{t("notEnabledDesc")}</s-paragraph>
            <s-button
                slot="secondary-actions"
                variant="secondary"
                onClick={() => window.open(themeEditorUrl, "_blank")}
            >
                {t("enableButton")}
            </s-button>
        </s-banner>
    );
}
