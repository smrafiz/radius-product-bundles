"use client";

import { BundleListItem, ProductAvatarStack, ProductListPopover, useBundlePreview, } from "@/features/bundles";
import { useState } from "react";

/**
 * Bundle products preview
 *
 * Uses Polaris web components for popover
 */
export function BundleProductsPreview({ bundle }: { bundle: BundleListItem }) {
    const popoverId = `bundle-products-popover-${bundle.id}`;

    const { groupedProducts, displayProducts, remainingCount, arrowClass } =
        useBundlePreview(bundle.products);

    return (
        <>
            {/* Clickable activator */}
            <div className="group">
                <s-clickable commandFor={popoverId}>
                    <s-stack direction="inline" alignItems="center">
                        <ProductAvatarStack
                            products={displayProducts}
                            remainingCount={remainingCount}
                        />
                        <div
                            className={`w-10 h-10 relative ${arrowClass} flex items-center transition-opacity duration-200 opacity-0 group-hover:opacity-100`}
                        >
                            <s-icon type="caret-down" />
                        </div>
                    </s-stack>
                </s-clickable>
            </div>

            {/* Popover */}
            <s-popover id={popoverId}>
                <ProductListPopover products={groupedProducts} />
            </s-popover>
        </>
    );
}
