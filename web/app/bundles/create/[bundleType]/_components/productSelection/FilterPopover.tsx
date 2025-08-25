"use client";
import React, { useEffect } from "react";
import {
    BlockStack,
    Button,
    EmptySearchResult,
    InlineStack,
    Listbox,
    Scrollable,
    Select,
    Tag,
    Text,
    TextField,
} from "@shopify/polaris";
import { useProductSelectionStore } from "@/lib/stores/productSelectionStore";
import { useGraphQL } from "@/hooks/useGraphQL";
import { GetCollectionsForFiltersDocument } from "@/lib/gql/graphql";

const FILTER_OPTIONS = {
    status: [
        { label: "All", value: "" },
        { label: "Active", value: "ACTIVE" },
        { label: "Draft", value: "DRAFT" },
        { label: "Archived", value: "ARCHIVED" },
    ],
};

const PAGE_SIZE = 25;

export function FilterPopover() {
    const {
        filters,
        filterOptions,
        updateFilter,
        clearFilters,
        setFilterPopoverActive,
        // Collection states
        collectionQuery,
        collections,
        collectionsPageInfo,
        selectedCollectionTitle,
        collectionVariables,
        // Collection actions
        setCollectionQuery,
        setCollections,
        setCollectionsPageInfo,
        setSelectedCollectionTitle,
        setCollectionVariables,
        clearCollectionStates,
        // New action for filter options
        updateFilterOptionsFromProducts,
    } = useProductSelectionStore();

    const { data, isLoading, refetch } = useGraphQL(
        GetCollectionsForFiltersDocument,
        collectionVariables,
    );

    // Update collections and filter options when data arrives
    useEffect(() => {
        if (data?.collections) {
            setCollections(data.collections.edges);
            setCollectionsPageInfo(data.collections.pageInfo);
        }

        // Update filter options from products
        if (data?.products) {
            updateFilterOptionsFromProducts(data.products);
        }
    }, [data, setCollections, setCollectionsPageInfo, updateFilterOptionsFromProducts]);

    // Refetch when variables change
    useEffect(() => {
        void refetch();
    }, [collectionVariables, refetch]);

    // Sync selectedCollectionTitle whenever filters.collection or collections change
    useEffect(() => {
        if (!filters.collection) {
            setSelectedCollectionTitle(null);
            return;
        }
        const found = collections.find(e => e.node.id === filters.collection);
        if (found) {
            setSelectedCollectionTitle(found.node.title);
        }
    }, [filters.collection, collections, setSelectedCollectionTitle]);

    const handleQueryChange = (value: string) => {
        setCollectionQuery(value);
        if (value.length >= 1) {
            setCollectionVariables({
                query: `title:*${value}*`,
                first: PAGE_SIZE,
                after: null,
            });
        } else {
            setCollectionVariables({
                query: "",
                first: PAGE_SIZE,
                after: null,
            });
            setCollections([]);
            setCollectionsPageInfo(null);
        }
    };

    const handleLazyLoad = () => {
        if (!collectionsPageInfo?.hasNextPage || isLoading) return;
        setCollectionVariables({
            ...collectionVariables,
            after: collectionsPageInfo.endCursor,
        });
    };

    const handleSelect = (id: string) => {
        const selected = collections.find((e) => e.node.id === id);
        setSelectedCollectionTitle(selected?.node.title ?? null);
        updateFilter("collection", id);
        clearCollectionStates();
    };

    const handleClear = () => {
        updateFilter("collection", "");
        clearCollectionStates();
    };

    return (
        <div className="p-4 min-w-[300px]">
            <BlockStack gap="300">
                {/* Status */}
                <Select
                    label="Status"
                    options={FILTER_OPTIONS.status}
                    value={filters.status}
                    onChange={(value) => updateFilter("status", value)}
                />
                {/* Product Type */}
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
                {/* Collections */}
                <BlockStack gap="200">
                    <Text as="p" variant="bodyMd" fontWeight="medium">
                        Collections
                    </Text>
                    <TextField
                        label="Search collections"
                        labelHidden
                        placeholder="Search collections"
                        value={collectionQuery}
                        onChange={handleQueryChange}
                        autoComplete="off"
                        clearButton
                        onClearButtonClick={handleClear}
                    />
                    {collectionQuery && (
                        <Scrollable
                            style={{ maxHeight: "200px" }}
                            onScrolledToBottom={handleLazyLoad}
                            scrollbarGutter="stable"
                            scrollbarWidth="thin"
                        >
                            {isLoading ? (
                                <Listbox accessibilityLabel="Collections">
                                    <Listbox.Loading accessibilityLabel="Loading collections..." />
                                </Listbox>
                            ) : collections.length > 0 ? (
                                <Listbox accessibilityLabel="Collections" onSelect={handleSelect}>
                                    {collections.map((edge) => (
                                        <Listbox.Option
                                            key={edge.node.id}
                                            value={edge.node.id}
                                            selected={filters.collection === edge.node.id}
                                        >
                                            <Listbox.TextOption selected={filters.collection === edge.node.id}>
                                                {edge.node.title}
                                            </Listbox.TextOption>
                                        </Listbox.Option>
                                    ))}
                                </Listbox>
                            ) : (
                                <EmptySearchResult
                                    title=""
                                    description={`No collections found matching "${collectionQuery}"`}
                                />
                            )}
                        </Scrollable>
                    )}
                    {/* Selected collection tag */}
                    <div style={{ minHeight: "20px", marginTop: "8px" }}>
                        {filters.collection && selectedCollectionTitle && (
                            <InlineStack gap="200">
                                <Tag onRemove={handleClear}>{selectedCollectionTitle}</Tag>
                            </InlineStack>
                        )}
                    </div>
                </BlockStack>
                {/* Actions */}
                <InlineStack gap="200">
                    <Button
                        size="slim"
                        onClick={() => {
                            clearFilters();
                            clearCollectionStates();
                            setFilterPopoverActive(false);
                        }}
                    >
                        Clear all
                    </Button>
                    <Button
                        size="slim"
                        variant="primary"
                        onClick={() => setFilterPopoverActive(false)}
                    >
                        Done
                    </Button>
                </InlineStack>
            </BlockStack>
        </div>
    );
}