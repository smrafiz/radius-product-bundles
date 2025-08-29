"use client";

import React, { useMemo, useState, useCallback } from "react";
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
import { useBundleStore } from "@/stores";
import { useAppBridge } from "@shopify/app-bridge-react";
import type { SelectedItem } from "@/types";
import {
    DeleteIcon,
    DragHandleIcon,
    ImageIcon,
    PlusIcon,
} from "@shopify/polaris-icons";

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

// Sortable item wrapper
function SortableItem({ id, children }: { id: string; children: React.ReactNode }) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
    const style = {
        transform: transform ?
            `translate3d(${transform.x}px, ${transform.y}px, 0) scaleX(1) scaleY(1)` :
            undefined,
        transition: transition,
        zIndex: isDragging ? 1000 : 1,
    };

    return (
        <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
            {children}
        </div>
    );
}

export default function ProductsStep() {
    const app = useAppBridge();
    const [isLoading, setIsLoading] = useState(false);

    const {
        selectedItems,
        addSelectedItems,
        removeSelectedItem,
        updateSelectedItemQuantity,
        setSelectedItems,
        updateProductVariants,
        removeProductAndAllVariants,
    } = useBundleStore();

    const groupedItems = useMemo(() => {
        const groups: Record<string, {
            product: SelectedItem;
            variants: SelectedItem[];
            originalTotalVariants: number; // Track original total
        }> = {};

        selectedItems.forEach((item) => {
            if (!groups[item.productId]) {
                groups[item.productId] = {
                    product: item,
                    variants: [],
                    originalTotalVariants: item.totalVariants || 1
                };
            }
            if (item.type === "variant") {
                groups[item.productId].variants.push(item);
            }
        });

        return Object.values(groups);
    }, [selectedItems]);

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: { distance: 8 } // Increased distance to prevent accidental drags
        })
    );

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        if (over && active.id !== over.id) {
            // Get the indices of the grouped items (products), not individual selectedItems
            const activeProductIndex = groupedItems.findIndex(group => group.product.productId === active.id);
            const overProductIndex = groupedItems.findIndex(group => group.product.productId === over.id);

            if (activeProductIndex !== -1 && overProductIndex !== -1) {
                // Reorder the entire groups of products and variants
                const newGroupOrder = arrayMove(groupedItems, activeProductIndex, overProductIndex);

                // Flatten back to selectedItems array maintaining the new order
                const reorderedItems: SelectedItem[] = [];
                newGroupOrder.forEach(group => {
                    reorderedItems.push(group.product);
                    reorderedItems.push(...group.variants);
                });

                setSelectedItems(reorderedItems);
            }
        }
    };

    const handleAddProducts = useCallback(async () => {
        if (!app) return;

        setIsLoading(true);
        try {
            // Format existing selections - but don't lose variant info when reopening picker
            const existingSelections = groupedItems.map(group => {
                const selectedVariantIds = [group.product, ...group.variants]
                    .map(item => item.variantId)
                    .filter(Boolean);

                return {
                    id: group.product.productId,
                    variants: selectedVariantIds.length > 0 ?
                        selectedVariantIds.map(id => ({ id })) : undefined
                };
            });

            const result = await app.resourcePicker({
                type: "product",
                multiple: true,
                selectionIds: existingSelections,
                filter: {
                    variants: false,
                },
            });

            if (!result?.selection || result.selection.length === 0) {
                setIsLoading(false);
                return;
            }

            const selected: SelectedItem[] = [];

            for (const p of result.selection) {
                if (p.variants && p.variants.length > 1) {
                    // Multi-variant product - add all selected variants
                    p.variants.forEach((variant: any, index: number) => {
                        selected.push({
                            id: `variant-${variant.id}`,
                            productId: p.id,
                            variantId: variant.id,
                            title: index === 0 ? p.title : `${p.title} - ${variant.title}`,
                            type: index === 0 ? "product" : "variant",
                            quantity: 1,
                            image: variant.image?.originalSrc || p.images?.[0]?.originalSrc,
                            price: variant.price || "0.00",
                            sku: variant.sku || undefined,
                            handle: p.handle,
                            vendor: p.vendor,
                            productType: p.productType,
                            totalVariants: p.totalVariants || p.variants.length,
                        });
                    });
                } else {
                    // Single variant product
                    const defaultVariant = p.variants?.[0];
                    selected.push({
                        id: `product-${p.id}`,
                        productId: p.id,
                        variantId: defaultVariant?.id || null,
                        title: p.title,
                        type: "product",
                        quantity: 1,
                        image: p.images?.[0]?.originalSrc,
                        price: defaultVariant?.price || "0.00",
                        sku: defaultVariant?.sku || undefined,
                        handle: p.handle,
                        vendor: p.vendor,
                        productType: p.productType,
                        totalVariants: p.totalVariants,
                    });
                }
            }

            setSelectedItems(selected);
        } catch (err) {
            console.error("Resource picker error:", err);
        } finally {
            setIsLoading(false);
        }
    }, [app, groupedItems, setSelectedItems]);

    const handleEditVariants = useCallback(async (product: SelectedItem) => {
        if (!app) return;

        try {
            // Get current position of this product in the list to maintain order
            const currentPosition = selectedItems.findIndex(item => item.productId === product.productId);

            const numericProductId = product.productId.split('/').pop();
            const currentVariants = selectedItems
                .filter(item => item.productId === product.productId && item.variantId)
                .map(item => ({ id: item.variantId }))
                .filter(v => v.id);

            const selectionIds = [{
                id: product.productId,
                variants: currentVariants.length > 0 ? currentVariants : undefined
            }];

            const result = await app.resourcePicker({
                type: "product",
                multiple: false,
                query: product.title,
                selectionIds: selectionIds,
            });

            if (result?.selection?.[0]) {
                const selectedProduct = result.selection[0];
                const updatedVariants: SelectedItem[] = [];

                if (selectedProduct.variants && selectedProduct.variants.length > 1) {
                    selectedProduct.variants.forEach((variant: any, index: number) => {
                        updatedVariants.push({
                            id: `variant-${variant.id}`,
                            productId: selectedProduct.id,
                            variantId: variant.id,
                            title: index === 0 ? selectedProduct.title : `${selectedProduct.title} - ${variant.title}`,
                            type: index === 0 ? "product" : "variant",
                            quantity: 1,
                            image: variant.image?.originalSrc || selectedProduct.images?.[0]?.originalSrc,
                            price: variant.price || "0.00",
                            sku: variant.sku || undefined,
                            handle: selectedProduct.handle,
                            vendor: selectedProduct.vendor,
                            productType: selectedProduct.productType,
                            totalVariants: selectedProduct.totalVariants || selectedProduct.variantsCount || selectedProduct.variants.length,
                        });
                    });
                } else {
                    const defaultVariant = selectedProduct.variants?.[0];
                    updatedVariants.push({
                        id: `product-${selectedProduct.id}`,
                        productId: selectedProduct.id,
                        variantId: defaultVariant?.id || null,
                        title: selectedProduct.title,
                        type: "product",
                        quantity: 1,
                        image: selectedProduct.images?.[0]?.originalSrc,
                        price: defaultVariant?.price || "0.00",
                        sku: defaultVariant?.sku || undefined,
                        handle: selectedProduct.handle,
                        vendor: selectedProduct.vendor,
                        productType: selectedProduct.productType,
                        totalVariants: selectedProduct.totalVariants,
                    });
                }

                // Maintain position when updating variants
                updateProductVariants(product.productId, updatedVariants, currentPosition);
            }
        } catch (err) {
            console.error("Edit variants error:", err);
        }
    }, [app, selectedItems, updateProductVariants]);

    const handleClearAll = useCallback(() => {
        setSelectedItems([]);
    }, [setSelectedItems]);

    const handleRemoveProduct = useCallback((productId: string) => {
        // Remove all items (product + variants) for this productId
        removeProductAndAllVariants(productId);
    }, [removeProductAndAllVariants]);

    const getVariantInfo = (productId: string, originalTotal: number) => {
        const selectedCount = selectedItems.filter(item => item.productId === productId).length;
        return { selectedCount, originalTotal };
    };

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
                        <Button
                            variant="primary"
                            icon={PlusIcon}
                            onClick={handleAddProducts}
                            loading={isLoading}
                        >
                            Add Products
                        </Button>
                        {selectedItems.length > 0 && (
                            <Button variant="plain" tone="critical" icon={DeleteIcon} onClick={handleClearAll}>
                                Clear all
                            </Button>
                        )}
                    </InlineStack>
                    <BlockStack gap="200">
                        {groupedItems.length > 0 ? (
                            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                                <SortableContext
                                    items={groupedItems.map((item) => item.product.productId)}
                                    strategy={verticalListSortingStrategy}
                                >
                                    {groupedItems.map((group) => {
                                        const { product, variants, originalTotalVariants } = group;
                                        const { selectedCount, originalTotal } = getVariantInfo(product.productId, originalTotalVariants);
                                        const isMultiVariant = product.totalVariants > 1 && originalTotalVariants >= 1;

                                        return (
                                            <SortableItem key={product.productId} id={product.productId}>
                                                <Card background="bg-surface-secondary" padding="300">
                                                    <Box padding="0">
                                                        <InlineStack align="space-between" blockAlign="center" gap="400" wrap={false}>
                                                            <InlineStack gap="300" blockAlign="center" wrap={false}>
                                                                <div className="cursor-grab">
                                                                    <Icon source={DragHandleIcon} />
                                                                </div>
                                                                {product.image ? (
                                                                    <Thumbnail source={product.image} alt={product.title} size="small" />
                                                                ) : (
                                                                    <div className="w-10 h-10 bg-[var(--p-color-bg-surface)] border border-[var(--p-color-border)] rounded-[var(--p-border-radius-150)] flex items-center justify-center">
                                                                        <Icon source={ImageIcon} tone="subdued" />
                                                                    </div>
                                                                )}
                                                            </InlineStack>

                                                            <div className="w-full">
                                                                <BlockStack>
                                                                    <div className="w-full">
                                                                        <Text as="h3" variant="bodyMd" fontWeight="medium">
                                                                            {product.title.replace(/ - .+$/, "")}
                                                                        </Text>
                                                                    </div>

                                                                    {isMultiVariant && (
                                                                        <InlineStack align="start" gap="300">
                                                                            <Text as="p" variant="bodySm" tone="subdued">
                                                                                {selectedCount} of {originalTotal} variants selected
                                                                            </Text>
                                                                            <Button
                                                                                variant="plain"
                                                                                size="micro"
                                                                                onClick={() => handleEditVariants(product)}
                                                                            >
                                                                                Edit variants
                                                                            </Button>
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
                                                                        updateSelectedItemQuantity(product.id, parseInt(value) || 1)
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
                                                                onClick={() => handleRemoveProduct(product.productId)}
                                                                accessibilityLabel={`Remove ${product.title}`}
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
                                            Click "Add Products" to get started
                                        </Text>
                                    </BlockStack>
                                </InlineStack>
                            </Box>
                        )}
                    </BlockStack>
                </BlockStack>
            </Card>
        </BlockStack>
    );
}