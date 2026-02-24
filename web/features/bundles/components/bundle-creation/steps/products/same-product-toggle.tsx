"use client";

import { useBundleStore } from "@/features/bundles";

export function SameProductToggle() {
    const { bundleData, setSameProductMode, selectedItems } = useBundleStore();

    const handleToggle = () => {
        const newValue = !bundleData.sameProductMode;
        setSameProductMode(newValue);

        if (newValue) {
            const triggerItems = selectedItems.filter(
                (item) => item.role === "TRIGGER",
            );
            const existingRewardIds = new Set(
                selectedItems
                    .filter((item) => item.role === "REWARD")
                    .map((item) => item.productId),
            );

            const currentNonReward = selectedItems.filter(
                (item) => item.role !== "REWARD",
            );
            const mirroredRewards = triggerItems
                .filter((item) => !existingRewardIds.has(item.productId))
                .map((item) => ({
                    ...item,
                    role: "REWARD" as const,
                    id: `reward-${item.productId}`,
                }));

            const combined = [...currentNonReward, ...mirroredRewards];
            useBundleStore.getState().setSelectedItems(combined);
        } else {
            const withoutRewards = selectedItems.filter(
                (item) => item.role !== "REWARD",
            );
            useBundleStore.getState().setSelectedItems(withoutRewards);
        }
    };

    return (
        <s-section>
            <s-stack direction="inline" alignItems="center" gap="small">
                <s-checkbox
                    label="Same product for both"
                    checked={bundleData.sameProductMode || false}
                    onChange={handleToggle}
                />
                <s-text tone="neutral">
                    Customer buys and gets the same product (e.g., Buy 1 Get 1
                    Free)
                </s-text>
            </s-stack>
        </s-section>
    );
}
