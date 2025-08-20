import React from "react";
import {
    BlockStack,
    Button,
    InlineStack,
    RadioButton,
    Select,
    Text,
} from "@shopify/polaris";

import { FilterState } from "@/types";
import type { GetCollectionsForFiltersQuery } from "@/types/admin.generated";

interface Props {
    filters: any;
    filterOptions: any;
    collectionsData?: GetCollectionsForFiltersQuery;
    onFilterChange: (key: keyof FilterState, value: string | string[]) => void;
    onClearFilters: () => void;
    onClose: () => void;
}

const FILTER_OPTIONS = {
    status: [
        { label: "All", value: "" },
        { label: "Active", value: "ACTIVE" },
        { label: "Draft", value: "DRAFT" },
        { label: "Archived", value: "ARCHIVED" },
    ],
};

export function FilterPopover({
    filters,
    filterOptions,
    collectionsData,
    onFilterChange,
    onClearFilters,
    onClose,
}: Props) {
    return (
        <div style={{ padding: "16px", minWidth: "300px" }}>
            <BlockStack gap="300">
                <Select
                    label="Status"
                    options={FILTER_OPTIONS.status}
                    value={filters.status}
                    onChange={(value) => onFilterChange("status", value)}
                />

                <Select
                    label="Product Type"
                    options={[
                        { label: "All", value: "" },
                        ...filterOptions.types.map((type: string) => ({
                            label: type,
                            value: type,
                        })),
                    ]}
                    value={filters.productType}
                    onChange={(value) => onFilterChange("productType", value)}
                />

                <Select
                    label="Vendor"
                    options={[
                        { label: "All", value: "" },
                        ...filterOptions.vendors.map((vendor: string) => ({
                            label: vendor,
                            value: vendor,
                        })),
                    ]}
                    value={filters.vendor}
                    onChange={(value) => onFilterChange("vendor", value)}
                />

                {collectionsData?.collections?.edges && (
                    <BlockStack gap="200">
                        <Text as="p" variant="bodyMd" fontWeight="medium">
                            Collections
                        </Text>
                        <BlockStack gap="100">
                            {collectionsData.collections.edges
                                .slice(0, 5)
                                .map((edge) => (
                                    <RadioButton
                                        key={edge.node.id}
                                        label={edge.node.title}
                                        checked={
                                            filters.collection === edge.node.id
                                        }
                                        id={edge.node.id}
                                        name="collections"
                                        onChange={() =>
                                            onFilterChange(
                                                "collection",
                                                filters.collection ===
                                                    edge.node.id
                                                    ? ""
                                                    : edge.node.id,
                                            )
                                        }
                                    />
                                ))}
                        </BlockStack>
                    </BlockStack>
                )}

                <InlineStack gap="200">
                    <Button size="slim" onClick={onClearFilters}>
                        Clear all
                    </Button>
                    <Button size="slim" variant="primary" onClick={onClose}>
                        Done
                    </Button>
                </InlineStack>
            </BlockStack>
        </div>
    );
}
