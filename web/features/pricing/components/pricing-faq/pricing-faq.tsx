"use client";

import { useState } from "react";
import { PRICING_FAQ_ITEM, PricingFaqItem } from "@/features/pricing";
import { useTranslations } from "@/lib/i18n/provider";

export const PricingFaq = () => {
    const t = useTranslations("Pricing");
    const [expandedId, setExpandedId] = useState<string | number | null>(
        PRICING_FAQ_ITEM.length > 0 ? PRICING_FAQ_ITEM[0].id : null,
    );

    const handleToggle = (id: string | number) => {
        setExpandedId((prev) => (prev === id ? null : id));
    };

    return (
        <s-section padding="none">
            <s-stack padding="base">
                <div className="text-base font-semibold">{t("faq")}</div>
                <s-text color="subdued">
                    {t("faqDescription")}
                </s-text>
            </s-stack>

            {PRICING_FAQ_ITEM.map((item) => (
                <PricingFaqItem
                    key={item.id}
                    id={item.id}
                    title={t(`faqs.${item.id}.title`)}
                    description={t(`faqs.${item.id}.description`)}
                    expanded={expandedId === item.id}
                    onToggle={() => handleToggle(item.id)}
                />
            ))}
        </s-section>
    );
};
