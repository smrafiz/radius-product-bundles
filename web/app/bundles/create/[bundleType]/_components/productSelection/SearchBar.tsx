"use client";

import React from "react";
import {
    BlockStack,
    Box,
    Button,
    Card,
    Icon,
    InlineStack,
    Popover,
    Select,
    TextField,
} from "@shopify/polaris";
import { FilterIcon, SearchIcon } from "@shopify/polaris-icons";
import {
    FilterPopover,
    useProductSelectionStore,
} from "@/bundles/create/[bundleType]/_components/productSelection";

import type { GetCollectionsForFiltersQuery } from "@/types/admin.generated";

interface Props {
    collectionsData?: GetCollectionsForFiltersQuery;
    onBulkSelectAll: () => void;
    onBulkDeselectAll: () => void;
    hasProducts: boolean;
}

export function SearchBar({
    collectionsData,
    onBulkSelectAll,
    onBulkDeselectAll,
    hasProducts,
}: Props) {
    const {
        searchInput,
        searchBy,
        filterPopoverActive,
        activeFilterCount,
        setSearchInput,
        setSearchBy,
        setFilterPopoverActive,
        resetState,
    } = useProductSelectionStore();

    const handleClearSearch = () => {
        setSearchInput("");
        resetState();
    };

    return (
        <Card padding="0">
            <Box padding="400">
                <BlockStack gap="300">
                    {/* Search Bar */}
                    <InlineStack gap="200" align="space-between">
                        <div className="flex-1">
                            <TextField
                                label=""
                                placeholder="Search products"
                                value={searchInput}
                                onChange={setSearchInput}
                                prefix={<Icon source={SearchIcon} />}
                                clearButton
                                onClearButtonClick={handleClearSearch}
                                autoComplete="off"
                            />
                        </div>
                        <Select
                            label="Search by"
                            labelInline
                            options={[
                                { label: "All", value: "all" },
                                { label: "Title", value: "title" },
                                { label: "SKU", value: "sku" },
                                { label: "Barcode", value: "barcode" },
                            ]}
                            value={searchBy}
                            onChange={setSearchBy}
                        />
                    </InlineStack>

                    {/* Filter Toggle */}
                    <InlineStack gap="200" align="space-between">
                        <Popover
                            active={filterPopoverActive}
                            activator={
                                <Button
                                    onClick={() =>
                                        setFilterPopoverActive(
                                            !filterPopoverActive,
                                        )
                                    }
                                    disclosure={
                                        filterPopoverActive ? "up" : "down"
                                    }
                                    icon={FilterIcon}
                                >
                                    Add filter
                                    {activeFilterCount() > 0
                                        ? ` (${activeFilterCount()})`
                                        : ""}
                                </Button>
                            }
                            onClose={() => setFilterPopoverActive(false)}
                            preferredAlignment="left"
                        >
                            <FilterPopover collectionsData={collectionsData} />
                        </Popover>

                        {/* Bulk Actions */}
                        {hasProducts && (
                            <InlineStack gap="200">
                                <Button size="slim" onClick={onBulkSelectAll}>
                                    Select all
                                </Button>
                                <Button size="slim" onClick={onBulkDeselectAll}>
                                    Deselect all
                                </Button>
                            </InlineStack>
                        )}
                    </InlineStack>
                </BlockStack>
            </Box>
        </Card>
    );
}
