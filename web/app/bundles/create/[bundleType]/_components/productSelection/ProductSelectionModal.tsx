"use client";

import React, { useCallback, useEffect, useMemo, useRef } from "react";
import { useGraphQL } from "@/hooks/useGraphQL";
import { useDebounce } from "@/hooks/useDebounce";
import { useProductDataLoader } from "@/hooks/useProductDataLoader";

import {
    GetCollectionsForFiltersDocument,
    GetProductsDocument,
} from "@/lib/gql/graphql";
import { BlockStack, Box, Modal, Text } from "@shopify/polaris";
import {
    ProductList,
    SearchBar,
    useProductSelectionStore,
} from "@/app/bundles/create/[bundleType]/_components/productSelection";

import type {
    GetCollectionsForFiltersQuery,
    GetCollectionsForFiltersQueryVariables,
    GetProductsQuery,
    GetProductsQueryVariables,
} from "@/types/admin.generated";
import { SelectedItem } from "@/types";

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onProductsSelected: (items: SelectedItem[]) => void;
    selectedProductIds: string[];
    title?: string;
}

export function ProductSelectionModal({
    isOpen,
    onClose,
    onProductsSelected,
    selectedProductIds,
    title = "Add products",
}: Props) {
    const scrollRef = useRef<HTMLDivElement>(null);

    // Zustand store state and actions
    const {
        searchInput,
        selectedItems,
        allLoadedProducts,
        nextCursor,
        isLoadingMore,
        setModalOpen,
        setDebouncedSearch,
        resetState,
        selectAllProducts,
        deselectAllProducts,
        setFilterOptions,
    } = useProductSelectionStore();

    // Debounce search input
    const debouncedSearch = useDebounce(searchInput, 500);

    // Update debounced search in store
    useEffect(() => {
        setDebouncedSearch(debouncedSearch);
    }, [debouncedSearch, setDebouncedSearch]);

    // Product data loader
    const { productsQuery, loadMoreProducts } = useProductDataLoader();

    // Fetch all products for filter options
    const allProductsVariables: GetProductsQueryVariables = {
        first: 100,
        query: "status:ACTIVE",
    };

    const allProductsQuery = useGraphQL(
        GetProductsDocument as any,
        allProductsVariables,
    ) as {
        data?: GetProductsQuery;
        loading: boolean;
        error?: Error | null;
    };

    // Collection data for filters
    const collectionsVariables: GetCollectionsForFiltersQueryVariables = {
        query: "",
        first: 50,
    };

    const collectionsQuery = useGraphQL<
        GetCollectionsForFiltersQuery,
        GetCollectionsForFiltersQueryVariables
    >(GetCollectionsForFiltersDocument, collectionsVariables);

    // Extract filter options from all product data
    const filterOptions = useMemo(() => {
        if (!allProductsQuery.data?.products?.edges) {
            return { types: [], vendors: [], tags: [] };
        }

        const types = new Set<string>();
        const vendors = new Set<string>();
        const tags = new Set<string>();

        allProductsQuery.data.products.edges.forEach((edge: any) => {
            const product = edge.node;

            if (product.productType) {
                types.add(product.productType);
            }

            if (product.vendor) {
                vendors.add(product.vendor);
            }

            (product.tags || []).forEach((tag: string) => tags.add(tag));
        });

        return {
            types: Array.from(types).sort(),
            vendors: Array.from(vendors).sort(),
            tags: Array.from(tags).sort(),
        };
    }, [allProductsQuery.data]);

    // Update filter options in store
    useEffect(() => {
        setFilterOptions(filterOptions);
    }, [filterOptions, setFilterOptions]);

    // Modal state management
    useEffect(() => {
        setModalOpen(isOpen);
    }, [isOpen, setModalOpen]);

    // Scroll handler for pagination
    const handleScroll = useCallback(() => {
        if (!scrollRef.current || !nextCursor || isLoadingMore) return;

        const { scrollTop, clientHeight, scrollHeight } = scrollRef.current;
        const threshold = 50;

        if (scrollTop + clientHeight >= scrollHeight - threshold) {
            void loadMoreProducts();
        }
    }, [nextCursor, isLoadingMore, loadMoreProducts]);

    // Attach scroll listener
    useEffect(() => {
        const scrollElement = scrollRef.current;
        if (scrollElement) {
            scrollElement.addEventListener("scroll", handleScroll);
            return () =>
                scrollElement.removeEventListener("scroll", handleScroll);
        }
    }, [handleScroll]);

    // Bulk selection handlers
    const handleSelectAll = useCallback(() => {
        selectAllProducts(allLoadedProducts, selectedProductIds);
    }, [selectAllProducts, allLoadedProducts, selectedProductIds]);

    const handleDeselectAll = useCallback(() => {
        deselectAllProducts();
    }, [deselectAllProducts]);

    // Modal action handlers
    const handleAdd = useCallback(() => {
        onProductsSelected(selectedItems);
        resetState();
        onClose();
    }, [selectedItems, onProductsSelected, resetState, onClose]);

    const handleCancel = useCallback(() => {
        resetState();
        onClose();
    }, [resetState, onClose]);

    return (
        <Modal
            open={isOpen}
            onClose={handleCancel}
            title={title}
            primaryAction={{
                content: `Add ${selectedItems.length > 0 ? `(${selectedItems.length})` : ""}`,
                onAction: handleAdd,
                disabled: selectedItems.length === 0,
            }}
            secondaryActions={[{ content: "Cancel", onAction: handleCancel }]}
        >
            <Modal.Section>
                <BlockStack gap="400">
                    {/* Search and Filter Section */}
                    <SearchBar
                        collectionsData={collectionsQuery.data}
                        onBulkSelectAll={handleSelectAll}
                        onBulkDeselectAll={handleDeselectAll}
                        hasProducts={allLoadedProducts.length > 0}
                    />

                    {/* Product List */}
                    <ProductList
                        ref={scrollRef}
                        products={allLoadedProducts}
                        selectedProductIds={selectedProductIds}
                        isLoading={productsQuery.loading}
                        error={productsQuery.error}
                        nextCursor={nextCursor}
                        isLoadingMore={isLoadingMore}
                    />

                    {/* Selection Summary */}
                    {selectedItems.length > 0 && (
                        <Box padding="200">
                            <Text as="p" variant="bodySm" tone="subdued">
                                {selectedItems.length} item
                                {selectedItems.length !== 1 ? "s" : ""} selected
                            </Text>
                        </Box>
                    )}
                </BlockStack>
            </Modal.Section>
        </Modal>
    );
}
