"use client";

import {
    SortableContext,
    verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useDragAndDrop } from "@/shared";
import { closestCenter, DndContext } from "@dnd-kit/core";
import { ProductItem, useBundleStore } from "@/features/bundles";
import { BlockStack, Box, InlineStack, Text } from "@shopify/polaris";

export function ProductList() {
    const { getGroupedItems } = useBundleStore();
    const { sensors, handleDragEnd } = useDragAndDrop();

    const groupedItems = getGroupedItems();

    if (groupedItems.length === 0) {
        return (
            <Box
                padding="800"
                background="bg-surface-secondary"
                borderRadius="200"
            >
                <InlineStack align="center">
                    <BlockStack gap="200" inlineAlign="center">
                        <Text as="h6" variant="headingSm" tone="subdued">
                            No products selected
                        </Text>
                        <Text as="p" variant="bodySm" tone="subdued">
                            Click "Add Products" to get started
                        </Text>
                    </BlockStack>
                </InlineStack>
            </Box>
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
                <BlockStack gap="200">
                    {groupedItems.map((group) => (
                        <ProductItem
                            key={group.product.productId}
                            group={group}
                        />
                    ))}
                </BlockStack>
            </SortableContext>
        </DndContext>
    );
}
