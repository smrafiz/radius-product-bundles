"use client";

import React from "react";
import {
    Box,
    Button,
    Card,
    Icon,
    InlineStack,
    Text,
    TextField,
    Thumbnail,
    BlockStack,
} from "@shopify/polaris";
import {
    DeleteIcon,
    DragHandleIcon,
    ImageIcon,
} from "@shopify/polaris-icons";
import { useSortable } from "@dnd-kit/sortable";
import { useBundleStore } from "@/stores";
import { useProductPicker } from "@/hooks/product";
import { ProductGroup } from "@/types";

interface ProductItemProps {
    group: ProductGroup;
}

// Sortable wrapper component
function SortableWrapper({ id, children }: { id: string; children: React.ReactNode }) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });

    const style = {
        transform: transform
            ? `translate3d(${transform.x}px, ${transform.y}px, 0) scaleX(1) scaleY(1)`
            : undefined,
        transition: transition,
        zIndex: isDragging ? 1000 : 1,
    };

    return (
        <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
            {children}
        </div>
    );
}

export default function ProductItem({ group }: ProductItemProps) {
    const {
        updateSelectedItemQuantity,
        removeProductAndAllVariants,
        getVariantInfo
    } = useBundleStore();

    const { editProductVariants } = useProductPicker();

    const { product, originalTotalVariants } = group;
    const { selectedCount, originalTotal } = getVariantInfo(product.productId);
    const isMultiVariant = product.totalVariants > 1 && originalTotalVariants >= 1;

    const handleQuantityChange = (value: string) => {
        const quantity = parseInt(value) || 1;
        updateSelectedItemQuantity(product.id, quantity);
    };

    const handleRemoveProduct = () => {
        removeProductAndAllVariants(product.productId);
    };

    const handleEditVariants = () => {
        editProductVariants(product);
    };

    return (
        <SortableWrapper id={product.productId}>
            <Card background="bg-surface-secondary" padding="300">
                <Box padding="0">
                    <InlineStack align="space-between" blockAlign="center" gap="400" wrap={false}>
                        {/* Drag handle and image */}
                        <InlineStack gap="300" blockAlign="center" wrap={false}>
                            <div className="cursor-grab">
                                <Icon source={DragHandleIcon} />
                            </div>
                            {product.image ? (
                                <Thumbnail
                                    source={product.image}
                                    alt={product.title}
                                    size="small"
                                />
                            ) : (
                                <div className="w-10 h-10 bg-[var(--p-color-bg-surface)] border border-[var(--p-color-border)] rounded-[var(--p-border-radius-150)] flex items-center justify-center">
                                    <Icon source={ImageIcon} tone="subdued" />
                                </div>
                            )}
                        </InlineStack>

                        {/* Product info */}
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
                                            onClick={handleEditVariants}
                                        >
                                            Edit variants
                                        </Button>
                                    </InlineStack>
                                )}
                            </BlockStack>
                        </div>

                        {/* Quantity input */}
                        <div className="max-w-[100px]">
                            <TextField
                                label="Quantity"
                                labelHidden
                                value={(product.quantity || 1).toString()}
                                onChange={handleQuantityChange}
                                type="number"
                                min="1"
                                autoComplete="off"
                                autoSize
                            />
                        </div>

                        {/* Remove button */}
                        <Button
                            variant="plain"
                            icon={DeleteIcon}
                            onClick={handleRemoveProduct}
                            accessibilityLabel={`Remove ${product.title}`}
                        />
                    </InlineStack>
                </Box>
            </Card>
        </SortableWrapper>
    );
}