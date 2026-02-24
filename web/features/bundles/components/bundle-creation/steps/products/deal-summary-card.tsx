"use client";

import { useBundleStore } from "@/features/bundles";

export function DealSummaryCard() {
    const { getTriggerProducts, getRewardProducts, bundleData } =
        useBundleStore();

    const triggerProducts = getTriggerProducts();
    const rewardProducts = getRewardProducts();

    if (triggerProducts.length === 0 && rewardProducts.length === 0) {
        return null;
    }

    const triggerNames = triggerProducts
        .map((p) => p.title.replace(/ - .+$/, ""))
        .join(", ");
    const rewardNames = rewardProducts
        .map((p) => p.title.replace(/ - .+$/, ""))
        .join(", ");

    const discountType = bundleData.discountType;
    const discountValue = bundleData.discountValue;

    let discountLabel = "at a discount";
    if (discountType === "PERCENTAGE" && discountValue) {
        discountLabel =
            discountValue === 100
                ? "FREE"
                : `at ${discountValue}% off`;
    } else if (discountType === "FIXED_AMOUNT" && discountValue) {
        discountLabel = `at $${discountValue} off`;
    } else if (discountType === "CUSTOM_PRICE" && discountValue) {
        discountLabel = `for $${discountValue}`;
    } else if (discountType === "NO_DISCOUNT") {
        discountLabel = "at full price";
    }

    return (
        <s-section>
            <s-box
                padding="base"
                background="subdued"
                border="base"
                borderRadius="base"
            >
                <s-stack gap="small">
                    <s-heading>Deal preview</s-heading>
                    <s-text>
                        {triggerProducts.length > 0 && rewardProducts.length > 0
                            ? `Buy 1 × ${triggerNames} → Get 1 × ${rewardNames} ${discountLabel}`
                            : triggerProducts.length > 0
                              ? `Buy 1 × ${triggerNames} → Select reward products`
                              : `Select trigger products → Get 1 × ${rewardNames} ${discountLabel}`}
                    </s-text>
                </s-stack>
            </s-box>
        </s-section>
    );
}
