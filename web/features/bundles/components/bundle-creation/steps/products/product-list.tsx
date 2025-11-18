"use client";

import {
    SortableContext,
    verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useDragAndDrop, useProductPicker } from "@/shared";
import { closestCenter, DndContext } from "@dnd-kit/core";
import { ProductItem, useBundleStore } from "@/features/bundles";

export function ProductList() {
    const { getGroupedItems } = useBundleStore();
    const { sensors, handleDragEnd } = useDragAndDrop();
    const { openProductPicker, isLoading } = useProductPicker();

    const groupedItems = getGroupedItems();

    if (groupedItems.length === 0) {
        return (
            <s-box
                padding="base"
                background="subdued"
                border="base"
                borderRadius="base"
            >
                <s-stack gap="large" alignItems="center">
                    <s-button
                        variant="tertiary"
                        icon="plus"
                        onClick={openProductPicker}
                        loading={isLoading}
                    >
                        Add products
                    </s-button>
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
