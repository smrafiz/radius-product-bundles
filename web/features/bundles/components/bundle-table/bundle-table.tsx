"use client";

import {
    BundleIndexFilters,
    BundlePagination,
    BundleTableEmptyStates,
    BundleTableRow,
    useBundleActions,
    useBundleListingStore,
    useBundlesData,
    useBundleSelection,
    useBundleTableBulkActions,
} from "@/features/bundles";
import { useCallback } from "react";
import { Card, IndexTable, useBreakpoints } from "@shopify/polaris";

/**
 * Bundle table
 */
export function BundleTable() {
    const breakpoints = useBreakpoints();
    const { bundles, pagination, filters, showToast } = useBundleListingStore();
    const { isFetching } = useBundlesData();
    const safeBundles = Array.isArray(bundles) ? bundles : [];
    const {
        selectedResources,
        clearSelection,
        selectedBundle,
        allResourcesSelected,
        handleSelectionChange,
    } = useBundleSelection(safeBundles);

    // Check if any filters are active
    const hasActiveFilters =
        filters.search !== "" ||
        (filters.statusFilter as string[]).length > 0 ||
        (filters.typeFilter as string[]).length > 0 ||
        (filters.selectedTab as number) > 0;

    // For empty state logic
    const totalBundles = pagination.totalItems;

    const { actions: selectedBundleActions } = useBundleActions(
        selectedBundle || (safeBundles.length > 0 ? safeBundles[0] : null),
        clearSelection,
    );

    const { getPromotedBulkActions, getBulkActions } =
        useBundleTableBulkActions(clearSelection);

    // Handle clear selection
    const handleClearSelection = useCallback(() => {
        if (clearSelection) {
            clearSelection();
            showToast("Selection cleared");
        }
    }, [clearSelection, showToast]);

    const promotedBulkActions =
        selectedResources.length > 0
            ? [
                  ...getPromotedBulkActions(
                      selectedResources,
                      selectedBundle,
                      selectedBundleActions,
                  ),
                  { content: "Cancel", onAction: handleClearSelection },
              ]
            : [];

    const bulkActions = getBulkActions(
        selectedResources,
        selectedBundle,
        selectedBundleActions,
    );

    // Check for empty states
    if (safeBundles.length === 0) {
        return (
            <Card padding="0">
                <BundleIndexFilters loading={isFetching} />
                <BundleTableEmptyStates
                    totalBundles={hasActiveFilters ? 1 : totalBundles}
                    filteredBundlesCount={totalBundles}
                />
                <BundlePagination />
            </Card>
        );
    }

    // Render table rows
    const rowMarkup = safeBundles.map((bundle, index) => (
        <BundleTableRow
            key={bundle.id}
            bundle={bundle}
            index={index}
            isSelected={selectedResources.includes(bundle.id)}
        />
    ));

    return (
        <Card padding="0">
            <BundleIndexFilters loading={isFetching} />
            <IndexTable
                condensed={breakpoints.smDown}
                resourceName={{ singular: "bundle", plural: "bundles" }}
                itemCount={safeBundles.length}
                selectedItemsCount={
                    allResourcesSelected ? "All" : selectedResources.length
                }
                onSelectionChange={handleSelectionChange}
                promotedBulkActions={promotedBulkActions}
                bulkActions={bulkActions}
                headings={[
                    { title: "Bundle Name" },
                    { title: "Bundled Products" },
                    { title: "Type" },
                    { title: "Discount" },
                    { title: "Status" },
                    { title: "Actions", alignment: "center" },
                ]}
                selectable
            >
                {rowMarkup}
            </IndexTable>
            <BundlePagination />
        </Card>
    );
}
