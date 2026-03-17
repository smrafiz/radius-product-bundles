"use client";

import { useTranslations } from "@/lib/i18n/provider";
import { QUICK_LINKS } from "@/features/support/constants/support.constants";

export function SupportSidePanel() {
    const t = useTranslations("Support");

    return (
        <s-stack gap="base">
            {/* Support Hours */}
            <s-section padding="base">
                <s-stack gap="small-300">
                    <s-heading>{t("supportHours")}</s-heading>
                    <s-stack gap="small-200">
                        <s-text color="subdued">{t("schedule")}</s-text>
                        <s-divider />
                        <s-grid gridTemplateColumns="1fr auto" alignItems="center">
                            <s-text color="subdued">{t("responseTime")}</s-text>
                            <s-badge tone="success">{t("responseTimeValue")}</s-badge>
                        </s-grid>
                    </s-stack>
                </s-stack>
            </s-section>

            {/* Quick Links */}
            <s-section padding="base">
                <s-stack gap="small-300">
                    <s-heading>{t("quickLinks")}</s-heading>
                    <s-stack gap="small-200">
                        {QUICK_LINKS.map(({ key, url }) => (
                            <s-link
                                key={key}
                                onClick={() => window.open(url, "_blank")}
                            >
                                {t(key as Parameters<typeof t>[0])}
                            </s-link>
                        ))}
                    </s-stack>
                </s-stack>
            </s-section>

            {/* Pro Tip */}
            <s-banner tone="info" heading={t("proTipTitle")}>
                <s-text>{t("proTip")}</s-text>
            </s-banner>
        </s-stack>
    );
}
