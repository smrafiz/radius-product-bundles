"use client";

import {
    SortableContext,
    verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useDragAndDrop } from "@/shared";
import { closestCenter, DndContext } from "@dnd-kit/core";
import { ProductItem, useBundleStore } from "@/features/bundles";

export function ProductList() {
    const { getGroupedItems } = useBundleStore();
    const { sensors, handleDragEnd } = useDragAndDrop();

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
                    <div className="w-[150px] rounded-xl overflow-hidden bg-white">
                        <s-image
                            src="/assets/empty.png"
                            alt="No products selected"
                            aspectRatio="1.2/1"
                        />
                    </div>
                    <s-stack alignItems="center">
                        <s-heading>No products selected</s-heading>
                        <s-text>Click "Add Products" to get started</s-text>
                    </s-stack>
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
