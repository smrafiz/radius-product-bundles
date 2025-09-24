"use client";

import { Box, IndexTable, Text } from "@shopify/polaris";
import { getBundleProperty, getCurrencySymbol } from "@/utils";
import {
    BundleActionsGroup,
    BundleProductsPreview,
    StatusPopover,
} from "@/bundles/_components";

import { updateBundleStatus } from "@/actions";
import { useAppBridge } from "@shopify/app-bridge-react";

import { useShopSettings } from "@/hooks";
import { discountTypeConfigs } from "@/config";
import { useBundleListingStore } from "@/stores";
import { BundleListItem, BundleStatus } from "@/types";

interface Props {
    bundle: BundleListItem;
    index: number;
    isSelected: boolean;
}

export default function BundleTableRow({ bundle, index, isSelected }: Props) {
    const app = useAppBridge();
    const { isLoading, currencyCode } = useShopSettings();
    const currencySymbol = getCurrencySymbol(currencyCode);

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

    const updateBundleInStore = useBundleListingStore((s) => s.updateBundleInStore);

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
            <IndexTable.Cell>
                <Text variant="bodyMd" fontWeight="medium" as="h2">
                    {bundle.name}
                </Text>
            </IndexTable.Cell>

            {/* Bundled products */}
            <IndexTable.Cell>
                <Text variant="bodyMd" as="span">
                    <BundleProductsPreview bundle={bundle} />
                </Text>
            </IndexTable.Cell>

            {/* Bundle type */}
            <IndexTable.Cell>
                <Text variant="bodyMd" fontWeight="medium" as="span">
                    {getBundleProperty(bundle.type, "label")}
                </Text>
            </IndexTable.Cell>

            {/* Bundle status */}
            <IndexTable.Cell className="text-center">
                <StatusPopover bundle={bundle} onStatusUpdate={handleStatusUpdate} />
            </IndexTable.Cell>

            {/* Bundle price */}
            <IndexTable.Cell>
                <Text variant="bodyMd" fontWeight="medium" as="span">
                    {formatDiscount(bundle)}
                </Text>
            </IndexTable.Cell>

            {/* Bundle views */}
            <IndexTable.Cell>
                <Text variant="bodyMd" as="span">
                    {bundle.views.toLocaleString()}
                </Text>
            </IndexTable.Cell>

            {/* Bundle actions */}
            <IndexTable.Cell>
                <Box padding="0">
                    <div className="flex justify-center">
                        <BundleActionsGroup bundle={bundle} />
                    </div>
                </Box>
            </IndexTable.Cell>
        </IndexTable.Row>
    );
}
