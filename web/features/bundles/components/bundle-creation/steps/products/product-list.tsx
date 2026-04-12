"use client";

import { useMemo, useCallback } from "react";
import {
    SortableContext,
    verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useDragAndDrop, useProductPicker } from "@/shared";
import {
    closestCenter,
    DndContext,
    DragEndEvent,
    useSensors,
    useSensor,
    PointerSensor,
} from "@dnd-kit/core";
import {
    ProductGroup,
    ProductItem,
    SelectedItem,
    useBundleStore,
} from "@/features/bundles";
import { useShallow } from "zustand/react/shallow";
import { useTranslations } from "@/lib/i18n/provider";

function buildBxgyGroups(items: SelectedItem[]): ProductGroup[] {
    return items.map((item) => ({
        id: item.id,
        title: item.title,
        product: item,
        variants: [],
        originalTotalVariants: item.totalVariants || 1,
        quantity: item.quantity || 1,
    }));
}

export function ProductList({
    isBxgy,
    isBogo,
}: {
    isBxgy?: boolean;
    isBogo?: boolean;
}) {
    const t = useTranslations("Bundles.Creation.Products");
    const { getGroupedItems, selectedItems, setItemRole, removeItemById } =
        useBundleStore(
            useShallow((s) => ({
                getGroupedItems: s.getGroupedItems,
                selectedItems: s.selectedItems,
                setItemRole: s.setItemRole,
                removeItemById: s.removeItemById,
            })),
        );
    const sameProductMode = useBundleStore((s) => s.bundleData.sameProductMode);
    const { sensors, handleDragEnd } = useDragAndDrop();
    const { openProductPicker, isLoading } = useProductPicker();

    // BOGO DnD: reorder by unique item.id
    const bxgySensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: { distance: 8 },
        }),
    );

    const handleBxgyDragEnd = useCallback((event: DragEndEvent) => {
        const { active, over } = event;
        if (!over || active.id === over.id) return;

        const activeId = active.id as string;
        const overId = over.id as string;

        useBundleStore.setState((state) => {
            const activeIndex = state.selectedItems.findIndex(
                (i) => i.id === activeId,
            );
            const overIndex = state.selectedItems.findIndex(
                (i) => i.id === overId,
            );

            if (activeIndex !== -1 && overIndex !== -1) {
                const newItems = [...state.selectedItems];
                const [moved] = newItems.splice(activeIndex, 1);
                newItems.splice(overIndex, 0, moved);
                state.selectedItems = newItems;
                state.bundleData.products = newItems.map((item) => ({
                    productId: item.productId,
                    variantId: item.variantId || "",
                    quantity: item.quantity,
                    role: item.role || "INCLUDED",
                }));
            }
        });
    }, []);

    // Fixed Bundle path: use grouped items as before
    const groupedItems = getGroupedItems();

    // BOGO path: build flat list from selectedItems with roles
    const bxgyGroups = useMemo(() => {
        if (!isBxgy) return [];
        const triggers = selectedItems.filter((i) => i.role === "TRIGGER");
        const rewards = selectedItems.filter((i) => i.role === "REWARD");
        return [...buildBxgyGroups(triggers), ...buildBxgyGroups(rewards)];
    }, [isBxgy, selectedItems]);

    const items = isBxgy ? bxgyGroups : groupedItems;

    const handleBxgyRemove = (itemId: string, productId: string) => {
        if (isBogo && sameProductMode) {
            // BOGO: remove both trigger and reward copies
            const toRemove = selectedItems.filter(
                (i) => i.productId === productId,
            );
            toRemove.forEach((i) => removeItemById(i.id));
        } else {
            removeItemById(itemId);
        }
    };

    if (items.length === 0) {
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
                        {t("addProducts")}
                    </s-button>
                </s-stack>
            </s-box>
        );
    }

    if (isBxgy) {
        return (
            <DndContext
                sensors={bxgySensors}
                collisionDetection={closestCenter}
                onDragEnd={handleBxgyDragEnd}
            >
                <SortableContext
                    items={bxgyGroups.map((g) => g.product.id)}
                    strategy={verticalListSortingStrategy}
                >
                    <s-stack gap="small-200">
                        {bxgyGroups.map((group) => (
                            <ProductItem
                                key={group.product.id}
                                group={group}
                                sortableId={group.product.id}
                                role={
                                    group.product.role as "TRIGGER" | "REWARD"
                                }
                                onRoleChange={(newRole) => {
                                    setItemRole(group.product.id, newRole);
                                    if (isBogo) {
                                        // BOGO: auto-swap (only 1 Buy + 1 Get)
                                        const swappedRole =
                                            newRole === "TRIGGER"
                                                ? "REWARD"
                                                : "TRIGGER";
                                        selectedItems
                                            .filter(
                                                (i) =>
                                                    i.id !== group.product.id &&
                                                    i.role === newRole,
                                            )
                                            .forEach((i) =>
                                                setItemRole(i.id, swappedRole),
                                            );
                                    }
                                    // BXGY: allow multiple Buy/Get, no swap
                                }}
                                quantityLocked={isBogo}
                                onRemove={
                                    isBogo &&
                                    sameProductMode &&
                                    group.product.role === "REWARD"
                                        ? null
                                        : () =>
                                              handleBxgyRemove(
                                                  group.product.id,
                                                  group.product.productId,
                                              )
                                }
                            />
                        ))}
                    </s-stack>
                </SortableContext>
            </DndContext>
        );
    }

    // Fixed Bundle: unchanged
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
