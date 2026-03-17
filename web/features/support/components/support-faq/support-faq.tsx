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
                <s-box
                    key={index}
                    padding="base"
                    borderBlockStart="base"
                >
                    <s-grid gridTemplateColumns="1fr auto" alignItems="start" gap="base">
                        <s-stack gap="small-100">
                            <s-text fontWeight="bold">{question}</s-text>
                            <s-text color="subdued">{answer}</s-text>
                        </s-stack>
                        <s-icon type="chevron-right" tone="subdued" />
                    </s-grid>
                </s-box>
            ))}
        </s-section>
    );
}
