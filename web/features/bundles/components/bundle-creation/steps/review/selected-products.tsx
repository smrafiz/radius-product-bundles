"use client";

import React, { useMemo, useState } from "react";
import { useBundleStore } from "@/features/bundles";

export function SelectedProducts() {
    const { getGroupedItems } = useBundleStore();
    const [open, setOpen] = useState(false);

    const groupedItems = getGroupedItems();
    const itemCount = useMemo(() => groupedItems.length, [groupedItems.length]);

    const handleToggle = () => setOpen((prev) => !prev);

    if (itemCount === 0) {
        return null;
    }

    return (
        <s-stack>
            {/* Header */}
            <s-stack
                direction="inline"
                justifyContent="space-between"
                alignItems="center"
                gap="small"
            >
                <s-heading>Selected products ({itemCount})</s-heading>
                <s-stack>
                    <s-clickable
                        onClick={handleToggle}
                        aria-expanded={open}
                        aria-label={open ? "Collapse products" : "Expand products"}
                    >
                        <s-icon type={open ? "chevron-up" : "chevron-down"} />
                    </s-clickable>
                </s-stack>
            </s-stack>

            {/* Collapsible Body */}
            <div
                style={{
                    overflow: "hidden",
                    transition: "max-height 0.3s ease, opacity 0.3s ease",
                    maxHeight: open ? "1000px" : "0",
                    opacity: open ? 1 : 0,
                }}
            >
                <s-stack gap="small" paddingBlock="base">
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
                                    {group.product.image && (
                                        <div className="w-10 h-10 bg-[var(--p-color-bg-surface)] border border-[var(--p-color-border)] rounded-[var(--p-border-radius-150)] flex items-center justify-center overflow-hidden">
                                            <s-image
                                                src={group.product.image}
                                                alt={group.product.title}
                                                aspectRatio="40/40"
                                                inlineSize="auto"
                                                loading="lazy"
                                            />
                                        </div>
                                    )}

                                    <s-stack>
                                        <s-heading>
                                            {group.product.title}
                                        </s-heading>
                                        {(group.product.vendor ||
                                            group.product.productType) && (
                                            <s-text color="subdued">
                                                {[
                                                    group.product.vendor,
                                                    group.product.productType,
                                                ]
                                                    .filter(Boolean)
                                                    .join(" • ")}
                                            </s-text>
                                        )}
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
