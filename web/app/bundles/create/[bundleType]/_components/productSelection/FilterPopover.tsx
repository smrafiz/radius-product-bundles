"use client";

import React from "react";
import {
    BlockStack,
    Button,
    InlineStack,
    RadioButton,
    Select,
    Text,
} from "@shopify/polaris";

import { useProductSelectionStore } from "@/app/bundles/create/[bundleType]/_components/productSelection";
import type { GetCollectionsForFiltersQuery } from "@/types/admin.generated";

interface Props {
    collectionsData?: GetCollectionsForFiltersQuery;
}

const FILTER_OPTIONS = {
    status: [
        { label: "All", value: "" },
        { label: "Active", value: "ACTIVE" },
        { label: "Draft", value: "DRAFT" },
        { label: "Archived", value: "ARCHIVED" },
    ],
};

export function FilterPopover({ collectionsData }: Props) {
    const {
        filters,
        filterOptions,
        updateFilter,
        clearFilters,
        setFilterPopoverActive,
    } = useProductSelectionStore();

    return (
        <div className="p-4 min-w-[300px]">
            <BlockStack gap="300">
                <Select
                    label="Status"
                    options={FILTER_OPTIONS.status}
                    value={filters.status}
                    onChange={(value) => updateFilter("status", value)}
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
                    onChange={(value) => updateFilter("productType", value)}
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
                    onChange={(value) => updateFilter("vendor", value)}
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
                                        checked={filters.collection === edge.node.id}
                                        id={edge.node.id}
                                        name="collections"
                                        onChange={() =>
                                            updateFilter(
                                                "collection",
                                                filters.collection === edge.node.id
                                                    ? ""
                                                    : edge.node.id
                                            )
                                        }
                                    />
                                ))}
                        </BlockStack>
                    </BlockStack>
                )}

                <InlineStack gap="200">
                    <Button size="slim" onClick={clearFilters}>
                        Clear all
                    </Button>
                    <Button size="slim" variant="primary" onClick={() => setFilterPopoverActive(false)}>
                        Done
                    </Button>
                </InlineStack>
            </BlockStack>
        </div>
    );
}