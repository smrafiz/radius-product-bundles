"use client";

import { useMemo, useState } from "react";
import { useBundleStore } from "@/features/bundles";
import { useTranslations } from "@/lib/i18n/provider";

export function SelectedProducts() {
    const t = useTranslations("Bundles.Creation.Review");
    const getGroupedItems = useBundleStore((s) => s.getGroupedItems);
    const [open, setOpen] = useState(true);

    const groupedItems = getGroupedItems();
    const itemCount = useMemo(() => groupedItems.length, [groupedItems.length]);

    const handleToggle = () => setOpen((prev) => !prev);

    if (itemCount === 0) {
        return null;
    }

    return (
        <s-stack>
            {/* Header */}
            <button
                type="button"
                className="cursor-pointer z-30 w-full text-left bg-transparent border-0 p-0"
                onClick={handleToggle}
                aria-expanded={open}
                aria-controls="selected-products-list"
            >
                <s-stack
                    direction="inline"
                    justifyContent="space-between"
                    alignItems="center"
                    gap="small"
                >
                    <s-heading>
                        {t("selectedProducts")} ({itemCount})
                    </s-heading>
                    <s-icon type={open ? "chevron-up" : "chevron-down"} aria-hidden="true" />
                </s-stack>
            </button>

            {/* Collapsible Body */}
            <div
                id="selected-products-list"
                className={`overflow-hidden transition-all duration-300 ease-in-out ${open ? "max-h-[1000px] opacity-100" : "max-h-0 opacity-0"}`}
            >
                <s-stack gap="small" paddingBlockStart="small">
                    {groupedItems.map((group) => (
                        <s-box
                            key={group.product.productId}
                            padding="small"
                            background="subdued"
                            border="base"
                            borderRadius="base"
                        >
                            <s-stack
                                direction="inline"
                                justifyContent="space-between"
                                alignItems="center"
                                gap="base"
                            >
                                {/* Product Info */}
                                <s-stack gap="base" direction="inline">
                                    {group.product.image ? (
                                        <div className="w-10 h-10 bg-white border border-gray-200 rounded-md flex items-center justify-center overflow-hidden">
                                            <s-image
                                                src={group.product.image}
                                                alt={group.product.title}
                                                aspectRatio="40/40"
                                                inlineSize="auto"
                                                loading="lazy"
                                                objectFit="cover"
                                            />
                                        </div>
                                    ) : (
                                        <div className="w-10 h-10 bg-white border border-gray-200 rounded-md flex items-center justify-center overflow-hidden">
                                            <s-icon
                                                type="image"
                                                tone="neutral"
                                            />
                                        </div>
                                    )}

                                    <s-stack
                                        direction="inline"
                                        gap="small-400"
                                        alignItems="center"
                                    >
                                        <s-text color="subdued">{group.quantity || 1} x</s-text>
                                        <s-heading>
                                            {group.product.title}
                                        </s-heading>
                                    </s-stack>
                                </s-stack>

                                {/* Price */}
                                {group.product.price && (
                                    <s-text type="strong">
                                        ${group.product.price}
                                    </s-text>
                                )}
                            </s-stack>
                        </s-box>
                    ))}
                </s-stack>
            </div>
        </s-stack>
    );
}
