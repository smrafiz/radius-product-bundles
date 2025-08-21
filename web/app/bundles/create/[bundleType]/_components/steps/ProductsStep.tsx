"use client";

import React, { useMemo, useState } from "react";
import {
    BlockStack,
    Box,
    Button,
    Card,
    Icon,
    InlineStack,
    Text,
    TextField,
    Thumbnail,
} from "@shopify/polaris";
import { useBundleStore } from "@/lib/stores/bundleStore";
import {
    ProductSelectionModal,
    SelectedItem,
} from "@/app/bundles/create/[bundleType]/_components/productSelection";
import { DeleteIcon, DragHandleIcon, PlusIcon } from "@shopify/polaris-icons";

import {
    DndContext,
    closestCenter,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent,
} from "@dnd-kit/core";
import {
    arrayMove,
    SortableContext,
    verticalListSortingStrategy,
    useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

// Sortable item wrapper
function SortableItem({ id, children }: { id: string; children: React.ReactNode }) {
    const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });
    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    return (
        <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
            {children}
        </div>
    );
}

export default function ProductsStep() {
    const {
        selectedItems,
        addSelectedItems,
        removeSelectedItem,
        updateSelectedItemQuantity,
        setSelectedItems,
    } = useBundleStore();

    const [isModalOpen, setIsModalOpen] = useState(false);

    const groupedItems = useMemo(() => {
        const groups: Record<string, { product: SelectedItem; variants: SelectedItem[] }> = {};
        selectedItems.forEach((item) => {
            if (!groups[item.productId]) groups[item.productId] = { product: item, variants: [] };
            if (item.type === "variant") groups[item.productId].variants.push(item);
        });
        return Object.values(groups);
    }, [selectedItems]);

    const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        if (over && active.id !== over.id) {
            const oldIndex = groupedItems.findIndex((item) => item.product.productId === active.id);
            const newIndex = groupedItems.findIndex((item) => item.product.productId === over.id);

            const newOrder = arrayMove(selectedItems, oldIndex, newIndex);
            setSelectedItems(newOrder);
        }
    };

    const handleAddProducts = () => setIsModalOpen(true);
    const handleCloseModal = () => setIsModalOpen(false);

    const handleProductsSelected = (items: SelectedItem[]) => {
        const transformedItems = items.map((item) => ({ ...item, quantity: 1 }));
        addSelectedItems(transformedItems);
        setIsModalOpen(false);
    };

    const handleClearAll = () => setSelectedItems([]);

    const selectedProductIds = selectedItems.map((item) => item.productId);

    return (
        <BlockStack gap="500">
            <BlockStack gap="200">
                <Text variant="headingLg" as="h2">
                    Products
                </Text>
                <Text as="p" variant="bodySm" tone="subdued">
                    Select products and variants to include in your bundle
                </Text>
            </BlockStack>

            <Card>
                <BlockStack gap="400">
                    <InlineStack align="space-between" blockAlign="center">
                        <Button variant="primary" icon={PlusIcon} onClick={handleAddProducts}>
                            Add Products
                        </Button>
                        {selectedItems.length > 0 && (
                            <Button variant="plain" tone="critical" icon={DeleteIcon} onClick={handleClearAll}>
                                Clear all
                            </Button>
                        )}
                    </InlineStack>

                    {groupedItems.length > 0 ? (
                        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                            <SortableContext
                                items={groupedItems.map((item) => item.product.productId)}
                                strategy={verticalListSortingStrategy}
                            >
                                {groupedItems.map((group, groupIndex) => {
                                    const { product, variants } = group;

                                    return (
                                        <SortableItem key={product.productId} id={product.productId}>
                                            <Card background="bg-surface-secondary" key={product.productId}>
                                                <Box padding="0">
                                                    <InlineStack align="space-between" blockAlign="center" gap="400" wrap={false}>
                                                        <InlineStack gap="300" blockAlign="center" wrap={false}>
                                                            <div className="cursor-grab">
                                                                <Icon source={DragHandleIcon} />
                                                            </div>
                                                            {product.image && (
                                                                <Thumbnail source={product.image} alt={product.title} size="small" />
                                                            )}
                                                        </InlineStack>

                                                        <div className="w-full">
                                                            <BlockStack gap="100">
                                                                <div className="w-full">
                                                                    <Text as="h3" variant="bodyMd" fontWeight="medium">
                                                                        {product.title.replace(/ - .+$/, "")}
                                                                    </Text>
                                                                </div>

                                                                {variants.length > 1 && (
                                                                    <InlineStack align="start" gap="300">
                                                                        <Text as="p" variant="bodySm" tone="subdued">
                                                                            {variants.length} of {product.totalVariants ?? variants.length} variants
                                                                            selected
                                                                        </Text>
                                                                        <Button variant="plain">Edit variants</Button>
                                                                    </InlineStack>
                                                                )}
                                                            </BlockStack>
                                                        </div>

                                                        <div className="max-w-[100px]">
                                                            <TextField
                                                                label="Quantity"
                                                                labelHidden
                                                                value={(product.quantity || 1).toString()}
                                                                onChange={(value) =>
                                                                    updateSelectedItemQuantity(groupIndex, parseInt(value) || 1)
                                                                }
                                                                type="number"
                                                                min="1"
                                                                autoComplete="off"
                                                                autoSize
                                                            />
                                                        </div>

                                                        <Button
                                                            variant="plain"
                                                            icon={DeleteIcon}
                                                            onClick={() => removeSelectedItem(groupIndex)}
                                                        />
                                                    </InlineStack>
                                                </Box>
                                            </Card>
                                        </SortableItem>
                                    );
                                })}
                            </SortableContext>
                        </DndContext>
                    ) : (
                        <Box padding="800" background="bg-surface-secondary" borderRadius="200">
                            <InlineStack align="center">
                                <BlockStack gap="200" inlineAlign="center">
                                    <Text as="h6" variant="headingSm" tone="subdued">
                                        No products selected
                                    </Text>
                                    <Text as="p" variant="bodySm" tone="subdued">
                                        Add products to create your bundle
                                    </Text>
                                </BlockStack>
                            </InlineStack>
                        </Box>
                    )}
                </BlockStack>
            </Card>

            <ProductSelectionModal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                onProductsSelected={handleProductsSelected}
                selectedProductIds={selectedProductIds}
                title="Add Products to Bundle"
            />
        </BlockStack>
    );
}