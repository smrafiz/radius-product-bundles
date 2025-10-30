"use client";

import React, { useState } from "react";
import { SETTINGS_FAQ_ITEM, SettingsFaqItem } from "@/features/settings";

export const SettingsFaq = () => {
    const [expandedId, setExpandedId] = useState<string | number | null>(
        SETTINGS_FAQ_ITEM.length > 0 ? SETTINGS_FAQ_ITEM[0].id : null
    );

    const handleToggle = (id: string | number) => {
        setExpandedId((prev) => (prev === id ? null : id));
    };

    return (
        <s-section padding="none">
            <s-stack padding="base">
                <s-heading>Frequently Asked Questions</s-heading>
                <s-text>
                    Find answers to the most common questions about our pricing and billing model below.
                </s-text>
            </s-stack>

            {/* Map through all FAQ items */}
            {SETTINGS_FAQ_ITEM.map((item) => (
                <SettingsFaqItem
                    key={item.id}
                    {...item}
                    expanded={expandedId === item.id}
                    onToggle={() => handleToggle(item.id)}
                />
            ))}
        </s-section>
    );
};
