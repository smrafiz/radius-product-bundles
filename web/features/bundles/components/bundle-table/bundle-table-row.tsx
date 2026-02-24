"use client";

import {
    BundleActionsGroup,
    bundleCurrencyFormatter,
    BundleProductsPreview,
    BundleTableRowProps,
    formatBundleDiscount,
    getBundleProperty,
    getBundleTypeBadge,
    StatusPopover,
    useBundleActions,
} from "@/features/bundles";
import { useShopSettings } from "@/shared";

/**
 * Bundle table row with web components
 */
export function BundleTableRow({
    bundle,
    isSelected,
    onToggleSelection,
}: BundleTableRowProps) {
    const { isLoading, currencyCode } = useShopSettings();
    const { actions } = useBundleActions(bundle);

    const currencyFormatter = bundleCurrencyFormatter(currencyCode, isLoading);
    const formatDiscount = () =>
        formatBundleDiscount(bundle, currencyFormatter);

    return (
        <s-table-row
            id={bundle.id}
            clickDelegate={`bundle-listing-item-${bundle.id}`}
        >
            {/* Bundle name */}
            <s-table-cell>
                <s-stack direction="inline" gap="small" alignItems="center">
                    <s-checkbox
                        id={`bundle-listing-item-${bundle.id}`}
                        checked={isSelected}
                        onChange={(e: Event) => {
                            e.stopPropagation();
                            onToggleSelection(bundle.id);
                        }}
                    />
                    <s-link
                        // removeUnderline
                        onClick={(e: Event) => {
                            e.stopPropagation();
                            actions.edit();
                        }}
                    >
                        <s-text>
                            <span className="block w-55 whitespace-normal! font-semibold">
                                {bundle.name}
                            </span>
                        </s-text>
                    </s-link>
                </s-stack>
            </s-table-cell>

            {/* Bundled products */}
            <s-table-cell>
                <div onClick={(e) => e.stopPropagation()}>
                    <s-text>
                        <span className="block w-30 whitespace-normal!">
                            <BundleProductsPreview bundle={bundle} />
                        </span>
                    </s-text>
                </div>
            </s-table-cell>

            {/* Bundle type */}
            <s-table-cell>
                <div onClick={(e) => e.stopPropagation()}>
                    {(() => {
                        const badge = getBundleTypeBadge(bundle.type);
                        return <s-badge tone={badge.tone}>{badge.text}</s-badge>;
                    })()}
                </div>
            </s-table-cell>

            {/* Bundle discount */}
            <s-table-cell>
                <div onClick={(e) => e.stopPropagation()}>
                    <s-text>
                        <span className="block w-30 whitespace-normal!">
                            {isLoading ? "•" : formatDiscount()}
                        </span>
                    </s-text>
                </div>
            </s-table-cell>

            {/* Bundle status */}
            <s-table-cell>
                <div onClick={(e) => e.stopPropagation()}>
                    <span className="block w-25 whitespace-normal!">
                        <StatusPopover bundle={bundle} />
                    </span>
                </div>
            </s-table-cell>

            {/* Bundle actions */}
            <s-table-cell>
                <div
                    onClick={(e) => e.stopPropagation()}
                    style={{ display: "flex", justifyContent: "center" }}
                >
                    <BundleActionsGroup bundle={bundle} onAction={actions} />
                </div>
            </s-table-cell>
        </s-table-row>
    );
}
