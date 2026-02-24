"use client";

import { useCallback } from "react";
import { useAppBridge } from "@shopify/app-bridge-react";
import {
    createSelectedItem,
    ProductGroup,
    useBundleStore,
} from "@/features/bundles";
import { BxgyProductItem } from "./bxgy-product-item";

export function RewardSection() {
    const app = useAppBridge();
    const {
        selectedItems,
        getRewardProducts,
        isLoading,
        setLoading,
        bundleData,
    } = useBundleStore();

    const rewardProducts = getRewardProducts();
    const isSameProduct = bundleData.sameProductMode;

    const openRewardPicker = useCallback(async () => {
        if (!app) return;
        setLoading(true);
        try {
            const existingSelections = rewardProducts
                .map((item) => ({
                    id: item.productId,
                    variants: item.variantIds?.length
                        ? item.variantIds.map((id) => ({ id }))
                        : undefined,
                }))
                .filter((s) => s.id.length > 0);

            const result = await app.resourcePicker({
                type: "product",
                multiple: true,
                selectionIds: existingSelections,
                filter: { hidden: true, variants: true, draft: false, archived: false },
            });

            if (!result || result.length === 0) return;

            const currentNonReward = selectedItems.filter(
                (item) => item.role !== "REWARD",
            );

            const newRewards = result.map((p: any, index: number) => {
                const item = createSelectedItem(p, { displayOrder: index });
                item.role = "REWARD";
                item.id = `reward-${item.productId}`;
                return item;
            });

            const combined = [...currentNonReward, ...newRewards];
            useBundleStore.getState().setSelectedItems(combined);
        } catch (err) {
            console.error("Reward picker error:", err);
        } finally {
            setLoading(false);
        }
    }, [app, rewardProducts, selectedItems, setLoading]);

    const handleRemove = (productId: string) => {
        const itemsToKeep = selectedItems.filter((item) => {
            if (item.productId === productId && item.role === "REWARD")
                return false;
            return true;
        });
        useBundleStore.getState().setSelectedItems(itemsToKeep);
    };

    const rewardGroups: ProductGroup[] = rewardProducts.map((item) => ({
        id: item.id,
        title: item.title,
        product: item,
        variants: [],
        originalTotalVariants: item.totalVariants || 1,
        quantity: item.quantity || 1,
    }));

    return (
        <s-section>
            <s-stack gap="base">
                <s-stack
                    direction="inline"
                    justifyContent="space-between"
                    alignItems="center"
                >
                    <s-stack>
                        <s-heading>Customer gets</s-heading>
                        <s-text tone="neutral">
                            Select the product(s) customer receives at a
                            discount
                        </s-text>
                    </s-stack>
                    {!isSameProduct && (
                        <s-button
                            variant="primary"
                            icon="plus"
                            onClick={openRewardPicker}
                            loading={isLoading}
                        >
                            Add reward products
                        </s-button>
                    )}
                </s-stack>

                {isSameProduct && rewardGroups.length > 0 && (
                    <s-banner tone="info">
                        Reward products are mirrored from trigger products
                    </s-banner>
                )}

                {rewardGroups.length === 0 ? (
                    <s-box
                        padding="base"
                        background="subdued"
                        border="base"
                        borderRadius="base"
                    >
                        <s-stack alignItems="center">
                            <s-text tone="neutral">
                                {isSameProduct
                                    ? "Add trigger products above"
                                    : "No reward products selected"}
                            </s-text>
                        </s-stack>
                    </s-box>
                ) : (
                    <s-stack gap="small-200">
                        {rewardGroups.map((group) => (
                            <BxgyProductItem
                                key={group.product.productId}
                                group={group}
                                roleBadge="REWARD"
                                onRemove={
                                    isSameProduct
                                        ? undefined
                                        : () =>
                                              handleRemove(
                                                  group.product.productId,
                                              )
                                }
                                quantityLocked
                            />
                        ))}
                    </s-stack>
                )}
            </s-stack>
        </s-section>
    );
}
