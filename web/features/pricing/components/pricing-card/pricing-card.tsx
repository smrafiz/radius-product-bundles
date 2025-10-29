"use client";

import { PRICING_CARD, PricingCardItem } from "@/features/pricing";

export const PricingCard = () => {
    return (
        <s-grid
            gridTemplateColumns="repeat(auto-fit, minmax(280px, 1fr))"
            gap="base"
            justifyContent="center"
        >
            {PRICING_CARD.map((item) => (
                <s-grid-item key={item.id} gridColumn="auto">
                    <PricingCardItem {...item} />
                </s-grid-item>
            ))}
        </s-grid>
    );
};
