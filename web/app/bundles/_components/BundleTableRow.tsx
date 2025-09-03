import React from "react";
import type { BundleListItem } from "@/stores";
import { Badge, IndexTable, Text } from "@shopify/polaris";
import {
    formatCurrency,
    getBundleTypeLabel,
    getStatusBadgeProps,
} from "@/utils";

interface BundleTableRowProps {
    bundle: BundleListItem;
    index: number;
    isSelected: boolean;
}

export function BundleTableRow({
    bundle,
    index,
    isSelected,
}: BundleTableRowProps) {
    const statusBadgeProps = getStatusBadgeProps(bundle.status);

    return (
        <IndexTable.Row
            id={bundle.id}
            key={bundle.id}
            selected={isSelected}
            position={index}
        >
            <IndexTable.Cell>
                <Text variant="bodyMd" fontWeight="medium" as="span">
                    {bundle.name}
                </Text>
            </IndexTable.Cell>

            <IndexTable.Cell>
                <Badge>{getBundleTypeLabel(bundle.type)}</Badge>
            </IndexTable.Cell>

            <IndexTable.Cell>
                <Badge tone={statusBadgeProps.tone as any}>
                    {statusBadgeProps.text}
                </Badge>
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
                    {bundle.productCount}
                </Text>
            </IndexTable.Cell>
        </IndexTable.Row>
    );
}
