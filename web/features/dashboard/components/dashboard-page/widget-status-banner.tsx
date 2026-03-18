"use client";

import { useTranslations } from "@/lib/i18n/provider";
import { useWidgetStatus } from "@/features/dashboard/hooks/use-widget-status";

export function WidgetStatusBanner({
    shopDomain,
    apiKey,
}: {
    shopDomain: string;
    apiKey: string;
}) {
    const t = useTranslations("Dashboard.WidgetBlock");
    const { isBlockActive, isChecking, themeEditorUrl } = useWidgetStatus({
        shopDomain,
        apiKey,
    });

    if (isChecking || isBlockActive || !themeEditorUrl) {
        return null;
    }

    return (
        <s-banner tone="warning" heading={t("notAdded")}>
            <s-paragraph>{t("notAddedDesc")}</s-paragraph>
            <s-button
                slot="secondary-actions"
                variant="secondary"
                onClick={() => window.open(themeEditorUrl, "_blank")}
            >
                {t("addButton")}
            </s-button>
        </s-banner>
    );
}
