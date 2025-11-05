"use client";

import { BlockStack, Box, InlineStack, Text } from "@shopify/polaris";
import { DndContext, closestCenter } from "@dnd-kit/core";
import {
    SortableContext,
    verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useDragAndDrop } from "@/hooks/ui";
import { ProductItem, useBundleStore } from "@/features/bundles";

export function ProductList() {
    const { getGroupedItems } = useBundleStore();
    const { sensors, handleDragEnd } = useDragAndDrop();

    const groupedItems = getGroupedItems();

    if (groupedItems.length === 0) {
        return (
            <s-box padding="base" background="subdued" border="base" borderRadius="base">
                    <s-stack gap="small-200" alignItems="center">
                        <s-heading>
                            No products selected
                        </s-heading>
                        <s-text>
                            Click "Add Products" to get started
                        </s-text>
                    </s-stack>
            </s-box>
        );
    }

    return (
        <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
        >
            <SortableContext
                items={groupedItems.map((item) => item.product.productId)}
                strategy={verticalListSortingStrategy}
            >
                <s-stack gap="small-200">
                    {groupedItems.map((group) => (
                        <ProductItem
                            key={group.product.productId}
                            group={group}
                        />
                    ))}
                </s-stack>
            </SortableContext>
        </DndContext>
    );
}
