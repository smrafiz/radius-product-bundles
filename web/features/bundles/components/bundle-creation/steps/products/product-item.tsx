"use client";

import { ReactNode } from "react";
import { useProductPicker } from "@/shared";
import { useSortable } from "@dnd-kit/sortable";
import { ProductGroup, useBundleStore } from "@/features/bundles";
import { useShallow } from "zustand/react/shallow";
import { useTranslations } from "@/lib/i18n/provider";

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

interface ProductItemProps {
    group: ProductGroup;
    role?: "TRIGGER" | "REWARD";
    onRoleChange?: (role: "TRIGGER" | "REWARD") => void;
    quantityLocked?: boolean;
    onRemove?: (() => void) | null;
    sortableId?: string;
    onMoveUp?: (id: string) => void;
    onMoveDown?: (id: string) => void;
    isFirst?: boolean;
    isLast?: boolean;
}

export function ProductItem({
    group,
    role,
    onRoleChange,
    quantityLocked,
    onRemove,
    sortableId,
    onMoveUp,
    onMoveDown,
    isFirst,
    isLast,
}: ProductItemProps) {
    const t = useTranslations("Bundles.Creation.Products");
    const {
        updateSelectedItemQuantity,
        removeProductAndAllVariants,
        getVariantInfo,
    } = useBundleStore(
        useShallow((s) => ({
            updateSelectedItemQuantity: s.updateSelectedItemQuantity,
            removeProductAndAllVariants: s.removeProductAndAllVariants,
            getVariantInfo: s.getVariantInfo,
        })),
    );

    const ROLE_LABELS: Record<string, string> = {
        TRIGGER: t("roleBuy"),
        REWARD: t("roleGet"),
    };

    const { editProductVariants } = useProductPicker();

    const { product, originalTotalVariants } = group;
    const { selectedCount, originalTotal } = getVariantInfo(product.productId, product.role);
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
        <SortableWrapper id={sortableId ?? product.productId}>
            <s-box
                paddingBlock="small"
                paddingInlineStart="small-200"
                paddingInlineEnd="small-300"
                background="subdued"
                border="base"
                borderRadius="base"
            >
                <div className="flex items-center gap-2">
                    {/* Drag handle + keyboard move buttons */}
                    <div className="flex flex-col items-center gap-0.5 flex-shrink-0">
                        {onMoveUp && (
                            <button
                                type="button"
                                aria-label={`Move ${product.title} up`}
                                disabled={isFirst}
                                onClick={() => onMoveUp(product.productId)}
                                className="sr-only focus:not-sr-only focus:static focus:w-auto focus:h-auto focus:p-0.5 focus:rounded"
                            >
                                ↑
                            </button>
                        )}
                        <div className="cursor-grab" aria-hidden="true">
                            <s-icon type="drag-handle" />
                        </div>
                        {onMoveDown && (
                            <button
                                type="button"
                                aria-label={`Move ${product.title} down`}
                                disabled={isLast}
                                onClick={() => onMoveDown(product.productId)}
                                className="sr-only focus:not-sr-only focus:static focus:w-auto focus:h-auto focus:p-0.5 focus:rounded"
                            >
                                ↓
                            </button>
                        )}
                    </div>

                    {/* Image */}
                    <div className="w-10 h-10 flex-shrink-0 bg-white border border-gray-200 rounded-md flex items-center justify-center overflow-hidden">
                        {product.image ? (
                            <s-image
                                src={product.image}
                                alt={product.title}
                                aspectRatio="40/40"
                                inlineSize="auto"
                                objectFit="cover"
                            />
                        ) : (
                            <s-icon type="image" tone="neutral" />
                        )}
                    </div>

                    {/* Product info — fills remaining space, truncates */}
                    <div className="flex-1 min-w-0">
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
                                    {t("variantsSelected", {
                                        count: String(selectedCount),
                                        total: String(originalTotal),
                                    })}
                                </s-text>
                                <s-link
                                    tone="neutral"
                                    onClick={handleEditVariants}
                                >
                                    {t("editVariants")}
                                </s-link>
                            </s-stack>
                        )}
                    </div>

                    {/* Controls — fixed width, never wrap */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                        {/* Role dropdown for BOGO */}
                        {role && onRoleChange && (
                            <div className="w-[80px]">
                                <s-select
                                    label={t("role")}
                                    labelAccessibilityVisibility="exclusive"
                                    value={role}
                                    onChange={(event: Event) => {
                                        const target =
                                            event.target as HTMLSelectElement;
                                        onRoleChange(
                                            target.value as
                                                | "TRIGGER"
                                                | "REWARD",
                                        );
                                    }}
                                >
                                    <s-option value="TRIGGER">
                                        {ROLE_LABELS.TRIGGER}
                                    </s-option>
                                    <s-option value="REWARD">
                                        {ROLE_LABELS.REWARD}
                                    </s-option>
                                </s-select>
                            </div>
                        )}
                        {/* Quantity */}
                        {quantityLocked ? (
                            <div className="w-[40px] text-center">
                                <s-text tone="neutral">{t("qty")} 1</s-text>
                            </div>
                        ) : (
                            <div className="w-[80px]">
                                <s-number-field
                                    label={t("quantity")}
                                    labelAccessibilityVisibility="exclusive"
                                    value={(product.quantity || 1).toString()}
                                    step={1}
                                    min={1}
                                    onInput={(event: Event) => {
                                        const target =
                                            event.target as HTMLInputElement;
                                        const value = target.value;
                                        handleQuantityChange(value);
                                    }}
                                />
                            </div>
                        )}
                        {/* Remove button */}
                        {onRemove !== null ? (
                            <s-button
                                variant="tertiary"
                                icon="delete"
                                onClick={onRemove ?? handleRemoveProduct}
                                accessibilityLabel={`${t("remove")} ${product.title}`}
                            />
                        ) : (
                            <div className="w-7" />
                        )}
                    </div>
                </div>
            </s-box>
        </SortableWrapper>
    );
}
