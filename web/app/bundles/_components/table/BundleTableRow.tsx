"use client";

import { Box, IndexTable, Link, Text } from "@shopify/polaris";
import { getBundleProperty, getCurrencySymbol } from "@/utils";
import {
    BundleActionsGroup,
    BundleProductsPreview,
    StatusPopover,
} from "@/bundles/_components";

import { updateBundleStatus } from "@/actions";
import { useAppBridge } from "@shopify/app-bridge-react";

import { discountTypeConfigs } from "@/config";
import { useBundleListingStore } from "@/stores";
import { BundleListItem, BundleStatus } from "@/types";
import { useBundleActions, useShopSettings } from "@/hooks";

interface Props {
    bundle: BundleListItem;
    index: number;
    isSelected: boolean;
}

export default function BundleTableRow({ bundle, index, isSelected }: Props) {
    const app = useAppBridge();
    const { isLoading, currencyCode } = useShopSettings();
    const currencySymbol = getCurrencySymbol(currencyCode);
    const { actions } = useBundleActions(bundle);

    const createCurrencyFormatter = () => {
        return (value: number) => {
            if (isLoading && !currencyCode) {
                return "•";
            }
            return `${currencySymbol}${value}`;
        };
    };

    const formatDiscount = (bundle: BundleListItem) => {
        if (!bundle.discountType) {
            return "No Discount";
        }

        const config = discountTypeConfigs[bundle.discountType];
        if (!config) {
            return "No Discount";
        }

        // Use the dynamic currency formatter
        const currencyFormatter = createCurrencyFormatter();
        return config.format(bundle.discountValue, currencyFormatter);
    };

    const updateBundleInStore = useBundleListingStore(
        (s) => s.updateBundleInStore,
    );

    const handleStatusUpdate = async (status: BundleStatus) => {
        try {
            const token = await app.idToken();
            const result = await updateBundleStatus(token, bundle.id, status);

            if (result.status === "success") {
                updateBundleInStore(bundle.id, { status: result.data.status });
                console.log("Updated:", result.data);
            } else {
                console.error("Update failed:", result.message);
            }
        } catch (err) {
            console.error("Error updating status:", err);
        }
    };

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
                <div className="cursor-default" onClick={(e) => e.stopPropagation()}>
                    <Text variant="bodyMd" fontWeight="medium" as="span">
                        {getBundleProperty(bundle.type, "label")}
                    </Text>
                </div>
            </IndexTable.Cell>

            {/* Bundle price */}
            <IndexTable.Cell>
                <div className="cursor-default" onClick={(e) => e.stopPropagation()}>
                    <Text
                        variant="bodyMd"
                        fontWeight="medium"
                        as="span"
                        tone="subdued"
                    >
                        {formatDiscount(bundle)}
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
                    <StatusPopover
                        bundle={bundle}
                        onStatusUpdate={handleStatusUpdate}
                    />
                </div>
            </IndexTable.Cell>

            {/* Bundle actions */}
            <IndexTable.Cell>
                <Box padding="0">
                    <div className="flex justify-center" onClick={(e) => e.stopPropagation()}>
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
