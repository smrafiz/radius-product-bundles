"use client";

import { useState } from "react";
import { PRICING_FAQ_ITEM, PricingFaqItem } from "@/features/pricing";

export const PricingFaq = () => {
    const [expandedId, setExpandedId] = useState<string | number | null>(
        PRICING_FAQ_ITEM.length > 0 ? PRICING_FAQ_ITEM[0].id : null,
    );

    const handleToggle = (id: string | number) => {
        setExpandedId((prev) => (prev === id ? null : id));
    };

    return (
        <s-section padding="none">
            <s-stack padding="base">
                <div className="text-base font-semibold">FAQ</div>
                <s-text color="subdued">
                    Find answers to the most common questions about our pricing
                    and billing model below.
                </s-text>
            </s-stack>

            {PRICING_FAQ_ITEM.map((item) => (
                <PricingFaqItem
                    key={item.id}
                    {...item}
                    expanded={expandedId === item.id}
                    onToggle={() => handleToggle(item.id)}
                />
            ))}
        </s-section>
    );
};
