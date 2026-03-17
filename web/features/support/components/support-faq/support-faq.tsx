"use client";

import { useTranslations } from "@/lib/i18n/provider";
import { FAQ_COUNT } from "@/features/support/constants/support.constants";

export function SupportFaq() {
    const t = useTranslations("Support");

    const faqs = Array.from({ length: FAQ_COUNT }, (_, i) => ({
        question: t(`faq${i + 1}Q` as Parameters<typeof t>[0]),
        answer:   t(`faq${i + 1}A` as Parameters<typeof t>[0]),
    }));

    return (
        <s-section padding="none">
            {/* Header */}
            <s-box padding="base" paddingBlockEnd="small">
                <s-grid gridTemplateColumns="1fr auto" alignItems="center">
                    <s-stack gap="small-100">
                        <s-heading>{t("faqTitle")}</s-heading>
                        <s-text color="subdued">{t("faqSubtitle")}</s-text>
                    </s-stack>
                    <s-badge tone="success">
                        {t("faqCount", { count: FAQ_COUNT })}
                    </s-badge>
                </s-grid>
            </s-box>

            {/* FAQ rows */}
            {faqs.map(({ question, answer }, index) => (
                <div key={index} style={{ borderTop: "1px solid var(--s-color-border)" }}>
                    <s-box padding="base">
                        <s-grid gridTemplateColumns="1fr auto" alignItems="start" gap="base">
                            <s-stack gap="small-100">
                                <s-heading>{question}</s-heading>
                                <s-text color="subdued">{answer}</s-text>
                            </s-stack>
                            <s-icon type="chevron-right" tone="neutral" />
                        </s-grid>
                    </s-box>
                </div>
            ))}
        </s-section>
    );
}
