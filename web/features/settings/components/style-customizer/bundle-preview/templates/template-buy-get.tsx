"use client";

import {
    BundleTemplateProps,
    BuyGetTier,
    getSpacing,
    useCustomizerStore,
} from "@/features/settings";
import { MiniProductCard } from "../../bundle-layout/cards/mini-product-card";
import { TierCard } from "../../bundle-layout/elements/tier-card";
import { TierTabs } from "../../bundle-layout/elements/tier-tabs";

const TIERS: ReadonlyArray<BuyGetTier> = [
    { buy: 2, get: 1, label: "Buy 2, Get 1 Free" },
    { buy: 3, get: 2, label: "Buy 3, Get 2 Free" },
];

export function TemplateBuyGet({ activeLayout }: BundleTemplateProps) {
    const { styles } = useCustomizerStore();
    const gap = getSpacing(styles.spacing);
    const tierStyle = styles.buyGetTierStyle;

    if (tierStyle === "tabs") {
        return (
            <div
                style={{
                    display: "flex",
                    flexDirection: "column",
                    gap,
                }}
            >
                <TierTabs tiers={TIERS} activeIndex={0} />
                <div
                    style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "6px",
                    }}
                >
                    {Array.from({ length: TIERS[0].buy }).map((_, j) => (
                        <MiniProductCard key={`buy-${j}`} />
                    ))}
                    {Array.from({ length: TIERS[0].get }).map((_, j) => (
                        <MiniProductCard
                            key={`get-${j}`}
                            isFree
                            freeTagColor={styles.bogoFreeTagColor}
                        />
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div
            style={{
                display: "flex",
                flexDirection: "column",
                gap,
            }}
        >
            {TIERS.map((tier, i) => (
                <TierCard key={i} label={tier.label} variant={tierStyle}>
                    <div
                        style={{
                            display: activeLayout === "GRID" ? "grid" : "flex",
                            gridTemplateColumns:
                                activeLayout === "GRID"
                                    ? "repeat(auto-fill, minmax(120px, 1fr))"
                                    : undefined,
                            flexDirection:
                                activeLayout !== "GRID" ? "column" : undefined,
                            gap: "6px",
                        }}
                    >
                        {Array.from({ length: tier.buy }).map((_, j) => (
                            <MiniProductCard key={`buy-${j}`} />
                        ))}
                        {Array.from({ length: tier.get }).map((_, j) => (
                            <MiniProductCard
                                key={`get-${j}`}
                                isFree
                                freeTagColor={styles.bogoFreeTagColor}
                            />
                        ))}
                    </div>
                </TierCard>
            ))}
        </div>
    );
}
