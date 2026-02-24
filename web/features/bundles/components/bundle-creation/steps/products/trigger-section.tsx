"use client";

import { useCallback } from "react";
import { useAppBridge } from "@shopify/app-bridge-react";
import {
    createSelectedItem,
    ProductGroup,
    useBundleStore,
} from "@/features/bundles";
import { BxgyProductItem } from "./bxgy-product-item";

export function TriggerSection() {
    const app = useAppBridge();
    const {
        selectedItems,
        addSelectedItems,
        removeProductAndAllVariants,
        getTriggerProducts,
        setProductRole,
        isLoading,
        setLoading,
        bundleData,
    } = useBundleStore();

    const triggerProducts = getTriggerProducts();
    const isSameProduct = bundleData.sameProductMode;

    const openTriggerPicker = useCallback(async () => {
        if (!app) return;
        setLoading(true);
        try {
            const existingSelections = triggerProducts
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

            const existingTriggerIds = new Set(
                triggerProducts.map((p) => p.productId),
            );
            const existingRewardIds = new Set(
                selectedItems
                    .filter((p) => p.role === "REWARD")
                    .map((p) => p.productId),
            );

            const currentNonTrigger = selectedItems.filter(
                (item) => item.role !== "TRIGGER",
            );

            const newTriggers = result.map((p: any, index: number) => {
                const item = createSelectedItem(p, { displayOrder: index });
                item.role = "TRIGGER";
                return item;
            });

            const combined = [...newTriggers, ...currentNonTrigger];
            useBundleStore.getState().setSelectedItems(combined);

            if (isSameProduct) {
                newTriggers.forEach((item) => {
                    if (!existingRewardIds.has(item.productId)) {
                        const rewardItem = { ...item, role: "REWARD" as const, id: `reward-${item.productId}` };
                        useBundleStore.getState().addSelectedItems([rewardItem]);
                    }
                });
            }
        } catch (err) {
            console.error("Trigger picker error:", err);
        } finally {
            setLoading(false);
        }
    }, [app, triggerProducts, selectedItems, isSameProduct, setLoading]);

    const handleRemove = (productId: string) => {
        const itemsToKeep = selectedItems.filter((item) => {
            if (item.productId === productId && item.role === "TRIGGER") return false;
            if (isSameProduct && item.productId === productId && item.role === "REWARD") return false;
            return true;
        });
        useBundleStore.getState().setSelectedItems(itemsToKeep);
    };

    const triggerGroups: ProductGroup[] = triggerProducts.map((item) => ({
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
                        <s-heading>Customer buys</s-heading>
                        <s-text tone="neutral">
                            Select the product(s) customer must purchase
                        </s-text>
                    </s-stack>
                    <s-button
                        variant="primary"
                        icon="plus"
                        onClick={openTriggerPicker}
                        loading={isLoading}
                    >
                        Add trigger products
                    </s-button>
                </s-stack>

                {triggerGroups.length === 0 ? (
                    <s-box
                        padding="base"
                        background="subdued"
                        border="base"
                        borderRadius="base"
                    >
                        <s-stack alignItems="center">
                            <s-text tone="neutral">
                                No trigger products selected
                            </s-text>
                        </s-stack>
                    </s-box>
                ) : (
                    <s-stack gap="small-200">
                        {triggerGroups.map((group) => (
                            <BxgyProductItem
                                key={group.product.productId}
                                group={group}
                                roleBadge="TRIGGER"
                                onRemove={() =>
                                    handleRemove(group.product.productId)
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
