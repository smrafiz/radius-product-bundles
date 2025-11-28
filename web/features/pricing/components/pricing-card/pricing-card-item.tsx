"use client";

import { useState } from "react";
import { PricingCardItemInfo } from "@/features/pricing";

export function PricingCardItem({
    title,
    description,
    price,
    features,
    featuredText,
    primaryButton,
    frequency,
}: PricingCardItemInfo) {

    const [loading, setLoading] = useState(false);

    const handleClick = async () => {
        setLoading(true);
        try {
            await new Promise((resolve) => setTimeout(resolve, 1000));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={`relative z-0 rounded-[0.75rem] ${featuredText ? "shadow-[0_0_15px_4px_#CDFEE1]" : "shadow-none"} `}>
            {featuredText ? (
                <div className="absolute top-[-15px] right-1.5 z-50">
                    <s-badge tone="success">{featuredText}</s-badge>
                </div>
            ) : null}
            <s-section padding="base">
                <s-stack direction="block" gap="large">
                    <s-stack direction="block" gap="base" alignItems="start">
                        <s-heading>
                            <div className="text-base font-semibold">{title}</div>
                        </s-heading>
                        <s-divider />
                        {description ? (
                            <s-paragraph color="subdued">
                                {description}
                            </s-paragraph>
                        ) : null}
                    </s-stack>

                    <s-stack
                        direction="inline"
                        gap="small-400"
                        alignItems="baseline"
                    >
                        <s-text>
                            <div className="text-2xl font-semibold">{price}</div>
                        </s-text>
                        <s-text>/ {frequency}</s-text>
                    </s-stack>

                    <s-stack direction="block" gap="small-400">
                        {features?.map((feature, index) => (
                            <s-stack
                                key={index}
                                direction="inline"
                                gap="small-400"
                                alignItems="center"
                            >
                                <s-icon
                                    type="check"
                                    tone="success"
                                    size="small"
                                />
                                <s-text>{feature}</s-text>
                            </s-stack>
                        ))}
                    </s-stack>

                    <s-stack alignItems="end">
                        <s-button
                            {...primaryButton.props}
                            loading={loading}
                            disabled={loading}
                            onClick={handleClick}
                        >
                            {loading ? "Please wait..." : primaryButton.content}
                        </s-button>
                    </s-stack>
                </s-stack>
            </s-section>
        </div>
    );
}
