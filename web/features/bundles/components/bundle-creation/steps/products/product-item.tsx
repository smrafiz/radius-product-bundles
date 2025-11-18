"use client";

import { ReactNode } from "react";
import { useProductPicker } from "@/shared";
import { useSortable } from "@dnd-kit/sortable";
import { ProductGroup, useBundleStore } from "@/features/bundles";

// Sortable wrapper component
function SortableWrapper({
    id,
    children,
}: {
    id: string;
    children: ReactNode;
}) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id });

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

export function ProductItem({ group }: { group: ProductGroup }) {
    const {
        updateSelectedItemQuantity,
        removeProductAndAllVariants,
        getVariantInfo,
    } = useBundleStore();

    const { editProductVariants } = useProductPicker();

    const { product, originalTotalVariants } = group;
    const { selectedCount, originalTotal } = getVariantInfo(product.productId);
    const isMultiVariant =
        product.totalVariants &&
        product.totalVariants > 1 &&
        originalTotalVariants >= 1;

    const handleQuantityChange = (value: string) => {
        const quantity = parseInt(value) || 1;
        updateSelectedItemQuantity(product.id, quantity);
    };

    const handleRemoveProduct = () => {
        removeProductAndAllVariants(product.productId);
    };

    const handleEditVariants = () => {
        void editProductVariants(product);
    };

    return (
        <SortableWrapper id={product.productId}>
            <s-box
                paddingBlock="small"
                paddingInlineStart="small-200"
                paddingInlineEnd="small-300"
                background="subdued"
                border="base"
                borderRadius="base"
            >
                <s-stack
                    direction="inline"
                    justifyContent="space-between"
                    alignItems="center"
                    gap="small"
                >
                    {/* Drag handle and image */}
                    <s-stack direction="inline" gap="small" alignItems="center">
                        <div className="cursor-grab">
                            <s-icon type="drag-handle" />
                        </div>
                        {product.image ? (
                            <div className="w-10 h-10 bg-[var(--p-color-bg-surface)] border border-[var(--p-color-border)] rounded-[var(--p-border-radius-150)] flex items-center justify-center overflow-hidden">
                                <s-image
                                    src={product.image}
                                    alt={product.title}
                                    aspectRatio="40/40"
                                    inlineSize="auto"
                                />
                            </div>
                        ) : (
                            <div className="w-10 h-10 bg-[var(--p-color-bg-surface)] border border-[var(--p-color-border)] rounded-[var(--p-border-radius-150)] flex items-center justify-center overflow-hidden">
                                <s-icon type="image" tone="neutral" />
                            </div>
                        )}

                        {/* Product info */}
                        <s-stack>
                            <div className="w-[250px]">
                                <s-heading>
                                    {product.title.replace(/ - .+$/, "")}
                                </s-heading>

                                {isMultiVariant && (
                                    <s-stack
                                        direction="inline"
                                        alignItems="center"
                                        gap="small"
                                    >
                                        <s-text tone="caution">
                                            {selectedCount} of {originalTotal}{" "}
                                            variants selected
                                        </s-text>
                                        <s-link
                                            tone="neutral"
                                            onClick={handleEditVariants}
                                        >
                                            Edit variants
                                        </s-link>
                                    </s-stack>
                                )}
                            </div>
                        </s-stack>
                    </s-stack>
                    <s-stack direction="inline" gap="small">
                        {/* Quantity input */}
                        <div className="max-w-[80px]">
                            <s-number-field
                                label="Quantity"
                                labelAccessibilityVisibility="exclusive"
                                value={(product.quantity || 1).toString()}
                                step={1}
                                min={1}
                                onChange={(event: Event) => {
                                    const target =
                                        event.target as HTMLInputElement;
                                    const value = target.value;
                                    handleQuantityChange(value);
                                }}
                            />
                        </div>
                        {/* Remove button */}
                        <s-button
                            variant="tertiary"
                            icon="delete"
                            onClick={handleRemoveProduct}
                            accessibilityLabel={`Remove ${product.title}`}
                        />
                    </s-stack>
                </s-stack>
            </s-box>
        </SortableWrapper>
    );
}
