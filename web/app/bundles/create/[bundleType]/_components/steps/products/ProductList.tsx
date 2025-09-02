import React from "react";
import { BlockStack, Box, InlineStack, Text } from "@shopify/polaris";
import {
    DndContext,
    closestCenter,
} from "@dnd-kit/core";
import {
    SortableContext,
    verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useBundleStore } from "@/stores";
import { useDragAndDrop } from "@/hooks/ui";
import { ProductItem } from "@/bundles/create/[bundleType]/_components/steps/products";

export default function ProductList() {
    const { getGroupedItems } = useBundleStore();
    const { sensors, handleDragEnd } = useDragAndDrop();

    const groupedItems = getGroupedItems();

    if (groupedItems.length === 0) {
        return (
            <Box padding="800" background="bg-surface-secondary" borderRadius="200">
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
                        <ProductItem key={group.product.productId} group={group} />
                    ))}
                </BlockStack>
            </SortableContext>
        </DndContext>
    );
}