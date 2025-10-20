"use client";

import {
    BundleProductsPreviewProps,
    ProductAvatarStack,
    ProductListPopover,
    useBundlePreview,
} from "@/features/bundles";
import { useCallback, useState } from "react";
import { Icon, InlineStack, Popover } from "@shopify/polaris";
import { ChevronDownIcon, ChevronUpIcon } from "@shopify/polaris-icons";

export function BundleProductsPreview({ bundle }: BundleProductsPreviewProps) {
    const [popoverActive, setPopoverActive] = useState(false);
    const togglePopover = useCallback(
        () => setPopoverActive((active) => !active),
        [],
    );

    const { groupedProducts, displayProducts, remainingCount, arrowClass } =
        useBundlePreview(bundle.products);

    const activator = (
        <div
            className="cursor-pointer flex items-center gap-1 group"
            onClick={togglePopover}
            aria-expanded={popoverActive}
            aria-controls="bundle-products-popover"
        >
            <InlineStack gap="100" align="center">
                <ProductAvatarStack
                    products={displayProducts}
                    remainingCount={remainingCount}
                />
                <div
                    className={`w-10 h-10 relative ${arrowClass} flex items-center transition-opacity duration-200 ${
                        popoverActive
                            ? "opacity-100"
                            : "opacity-0 group-hover:opacity-100"
                    }`}
                >
                    <Icon
                        source={popoverActive ? ChevronUpIcon : ChevronDownIcon}
                    />
                </div>
            </InlineStack>
        </div>
    );


    return (
        <Popover
            active={popoverActive}
            activator={activator}
            onClose={togglePopover}
            preferredAlignment="left"
        >
            <ProductListPopover products={groupedProducts} />
        </Popover>
    );
}
