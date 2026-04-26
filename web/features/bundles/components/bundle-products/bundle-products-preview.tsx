"use client";

import {
    BundleListItem,
    ProductAvatarStack,
    ProductListPopover,
    useBundlePreview,
} from "@/features/bundles";
import { useTranslations } from "@/lib/i18n/provider";

/**
 * Bundle products preview
 *
 * Uses Polaris web components for popover
 */
export function BundleProductsPreview({ bundle }: { bundle: BundleListItem }) {
    const t = useTranslations("Bundles.Listing.Table");
    const popoverId = `bundle-products-popover-${bundle.id}`;

    const { groupedProducts, displayProducts, remainingCount, arrowClass } =
        useBundlePreview(bundle.products);

    return (
        <>
            {/* Clickable activator */}
            <div className="group">
                <s-clickable
                    commandFor={popoverId}
                    accessibilityLabel={t("viewProductsInBundle", { name: bundle.name })}
                >
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
