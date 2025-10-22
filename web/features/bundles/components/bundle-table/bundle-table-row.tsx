"use client";

import {
    BundleActionsGroup,
    bundleCurrencyFormatter,
    BundleProductsPreview,
    BundleTableRowProps,
    formatBundleDiscount,
    getBundleProperty,
    StatusPopover,
    useBundleActions,
} from "@/features/bundles";
import { useShopSettings } from "@/shared";
import { Box, IndexTable, Link, Text } from "@shopify/polaris";

export function BundleTableRow({
    bundle,
    index,
    isSelected,
}: BundleTableRowProps) {
    const { isLoading, currencyCode } = useShopSettings();
    const { actions } = useBundleActions(bundle);

    const currencyFormatter = bundleCurrencyFormatter(currencyCode, isLoading);
    const formatDiscount = () =>
        formatBundleDiscount(bundle, currencyFormatter);

    return (
        <IndexTable.Row
            id={bundle.id}
            key={bundle.id}
            selected={isSelected}
            position={index}
        >
            {/* Bundle name */}
            <IndexTable.Cell className="w-[220px] !whitespace-normal" flush>
                <div onClick={(e) => e.stopPropagation()}>
                    <Link
                        removeUnderline
                        monochrome
                        onClick={() => actions.edit()}
                    >
                        <Text variant="bodyMd" fontWeight="medium" as="h2">
                            {bundle.name}
                        </Text>
                    </Link>
                </div>
            </IndexTable.Cell>

            {/* Bundled products */}
            <IndexTable.Cell className="w-[150px]">
                <div onClick={(e) => e.stopPropagation()}>
                    <Text variant="bodyMd" as="span">
                        <BundleProductsPreview bundle={bundle} />
                    </Text>
                </div>
            </IndexTable.Cell>

            {/* Bundle type */}
            <IndexTable.Cell>
                <div
                    className="cursor-default"
                    onClick={(e) => e.stopPropagation()}
                >
                    <Text variant="bodyMd" fontWeight="medium" as="span">
                        {getBundleProperty(bundle.type, "label")}
                    </Text>
                </div>
            </IndexTable.Cell>

            {/* Bundle price */}
            <IndexTable.Cell>
                <div
                    className="cursor-default"
                    onClick={(e) => e.stopPropagation()}
                >
                    <Text
                        variant="bodyMd"
                        fontWeight="medium"
                        as="span"
                        tone="subdued"
                    >
                        {isLoading ? "•" : formatDiscount()}
                    </Text>
                </div>
            </IndexTable.Cell>

            {/* Bundle views */}
            {/*<IndexTable.Cell>*/}
            {/*    <Text variant="bodyMd" as="span">*/}
            {/*        {bundle.views.toLocaleString()}*/}
            {/*    </Text>*/}
            {/*</IndexTable.Cell>*/}

            {/* Bundle status */}
            <IndexTable.Cell>
                <div onClick={(e) => e.stopPropagation()}>
                    <StatusPopover bundle={bundle} />
                </div>
            </IndexTable.Cell>

            {/* Bundle actions */}
            <IndexTable.Cell>
                <Box padding="0">
                    <div
                        className="flex justify-center"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <BundleActionsGroup
                            bundle={bundle}
                            onAction={actions}
                        />
                    </div>
                </Box>
            </IndexTable.Cell>
        </IndexTable.Row>
    );
}
