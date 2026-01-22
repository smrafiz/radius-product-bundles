"use client";

import {
    BundleActionsGroup,
    bundleCurrencyFormatter,
    BundleProductsPreview,
    formatBundleDiscount,
    getBundleProperty,
    StatusPopover,
    useBundleActions,
} from "@/features/bundles";
import { useShopSettings } from "@/shared";
import { useCallback } from "react";

interface BundleTableRowProps {
    bundle: any;
    index: number;
    isSelected: boolean;
    onToggleSelection: (bundleId: string) => void;
}

/**
 * Bundle table row with web components
 */
export function NewBundleTableRow({
    bundle,
    index,
    isSelected,
    onToggleSelection,
}: BundleTableRowProps) {
    const { isLoading, currencyCode } = useShopSettings();
    const { actions } = useBundleActions(bundle);

    const currencyFormatter = bundleCurrencyFormatter(currencyCode, isLoading);
    const formatDiscount = () =>
        formatBundleDiscount(bundle, currencyFormatter);

    const handleCheckboxChange = useCallback(
        (event: Event) => {
            event.stopPropagation();
            onToggleSelection(bundle.id);
        },
        [bundle.id, onToggleSelection],
    );

    return (
        <s-table-row id={bundle.id}>
            {/* Checkbox */}
            <s-table-cell>
                <s-checkbox
                    checked={isSelected}
                    onChange={handleCheckboxChange}
                />
            </s-table-cell>

            {/* Bundle name */}
            <s-table-cell>
                <s-link
                    // removeUnderline
                    onClick={(e: Event) => {
                        e.stopPropagation();
                        actions.edit();
                    }}
                >
                    <s-text>{bundle.name}</s-text>
                </s-link>
            </s-table-cell>

            {/* Bundled products */}
            <s-table-cell>
                <div onClick={(e) => e.stopPropagation()}>
                    <s-text>
                        <BundleProductsPreview bundle={bundle} />
                    </s-text>
                </div>
            </s-table-cell>

            {/* Bundle type */}
            <s-table-cell>
                <div onClick={(e) => e.stopPropagation()}>
                    <s-text>{getBundleProperty(bundle.type, "label")}</s-text>
                </div>
            </s-table-cell>

            {/* Bundle discount */}
            <s-table-cell>
                <div onClick={(e) => e.stopPropagation()}>
                    <s-text>{isLoading ? "•" : formatDiscount()}</s-text>
                </div>
            </s-table-cell>

            {/* Bundle status */}
            <s-table-cell>
                <div onClick={(e) => e.stopPropagation()}>
                    <StatusPopover bundle={bundle} />
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
