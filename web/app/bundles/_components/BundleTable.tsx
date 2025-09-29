"use client";

import { useCallback } from "react";
import {
    Card,
    IndexTable,
    useBreakpoints,
    useIndexResourceState,
} from "@shopify/polaris";
import {
    BundleIndexFilters,
    BundlePagination,
    BundleTableEmptyStates,
    BundleTableRow,
} from "@/bundles/_components";

import { useBundleActions, useBundleTableBulkActions } from "@/hooks";
import { useBundleListingStore } from "@/stores";

export default function BundleTable() {
    const breakpoints = useBreakpoints();
    const {
        getPaginatedBundles,
        getTotalBundlesCount,
        getFilteredBundles,
        showToast,
    } = useBundleListingStore();

    const paginatedBundles = getPaginatedBundles();
    const totalBundles = getTotalBundlesCount();
    const filteredBundles = getFilteredBundles();

    // Selection state
    const resourceIDResolver = (bundle: any) => bundle.id;
    const {
        selectedResources,
        allResourcesSelected,
        handleSelectionChange,
        clearSelection,
    } = useIndexResourceState(paginatedBundles, { resourceIDResolver });

    // Get selected bundle for single selection
    const selectedBundle =
        selectedResources.length === 1
            ? paginatedBundles.find(
                  (bundle) => bundle.id === selectedResources[0],
              )
            : null;

    const { actions: selectedBundleActions } = useBundleActions(
        selectedBundle || paginatedBundles[0],
    );

    // Actions hook
    const { getPromotedBulkActions, getBulkActions } =
        useBundleTableBulkActions();

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
    if (totalBundles === 0 || filteredBundles.length === 0) {
        return (
            <Card padding="0">
                <BundleIndexFilters />
                <BundleTableEmptyStates
                    totalBundles={totalBundles}
                    filteredBundlesCount={filteredBundles.length}
                />
                <BundlePagination />
            </Card>
        );
    }

    // Render table rows
    const rowMarkup = paginatedBundles.map((bundle, index) => (
        <BundleTableRow
            key={bundle.id}
            bundle={bundle}
            index={index}
            isSelected={selectedResources.includes(bundle.id)}
        />
    ));

    return (
        <Card padding="0">
            <BundleIndexFilters />
            <IndexTable
                condensed={breakpoints.smDown}
                resourceName={{ singular: "bundle", plural: "bundles" }}
                itemCount={paginatedBundles.length}
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
                    // { title: "Views" },
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
