"use client";

import { useState } from "react";
import { useTranslations } from "@/lib/i18n/provider";
import { PricingFaqItem } from "@/features/pricing";
import { FAQ_COUNT } from "@/features/support/constants/support.constants";

export function SupportFaq() {
    const t = useTranslations("Support");
    const [expandedId, setExpandedId] = useState<string | null>("0");

    const faqs = Array.from({ length: FAQ_COUNT }, (_, i) => ({
        id: String(i),
        title: t(`faq${i + 1}Q` as Parameters<typeof t>[0]),
        description: (
            <div
                className="prose prose-sm max-w-none [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:mb-2 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:mb-2 [&_li]:mt-1 [&_p]:mb-2 [&_strong]:font-semibold"
                dangerouslySetInnerHTML={{
                    __html: t(`faq${i + 1}A` as Parameters<typeof t>[0]),
                }}
            />
        ),
    }));

    return (
        <s-section padding="none">
            <s-stack padding="base">
                <div className="text-base font-semibold">{t("faqTitle")}</div>
                <s-text color="subdued">{t("faqSubtitle")}</s-text>
            </s-stack>

            {faqs.map((item) => (
                <PricingFaqItem
                    key={item.id}
                    id={item.id}
                    title={item.title}
                    description={item.description}
                    expanded={expandedId === item.id}
                    onToggle={() =>
                        setExpandedId((prev) =>
                            prev === item.id ? null : item.id,
                        )
                    }
                />
            ))}
        </s-section>
    );
}
