"use client";

import { IndexTable, Text } from "@shopify/polaris";
import { formatCurrency, getBundleProperty } from "@/utils";
import { BundleProductsPreview, StatusPopover } from "@/bundles/_components";

import { updateBundleStatus } from "@/actions";
import { useAppBridge } from "@shopify/app-bridge-react";

import { BundleListItem, BundleStatus } from "@/types";
import { useBundleListingStore } from "@/stores";

interface Props {
    bundle: BundleListItem;
    index: number;
    isSelected: boolean;
}

export default function BundleTableRow({ bundle, index, isSelected }: Props) {
    const app = useAppBridge();
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
            <IndexTable.Cell>
                <Text variant="bodyMd" fontWeight="medium" as="h2">
                    {bundle.name}
                </Text>
            </IndexTable.Cell>

            <IndexTable.Cell>
                <Text variant="bodyMd" as="span">
                    <BundleProductsPreview bundle={bundle} />
                </Text>
            </IndexTable.Cell>

            <IndexTable.Cell>
                <Text variant="bodyMd" fontWeight="medium" as="span">
                    {getBundleProperty(bundle.type, "label")}
                </Text>
            </IndexTable.Cell>

            <IndexTable.Cell>
                <StatusPopover bundle={bundle} onStatusUpdate={handleStatusUpdate} />
            </IndexTable.Cell>

            <IndexTable.Cell>
                <Text variant="bodyMd" fontWeight="medium" as="span">
                    {formatCurrency(bundle.revenue)}
                </Text>
            </IndexTable.Cell>

            <IndexTable.Cell>
                <Text variant="bodyMd" as="span">
                    {bundle.views.toLocaleString()}
                </Text>
            </IndexTable.Cell>

            <IndexTable.Cell>
                <Text variant="bodyMd" as="span">
                    Actions
                </Text>
            </IndexTable.Cell>
        </IndexTable.Row>
    );
}
