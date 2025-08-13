import React, { useCallback } from "react";
import {
    IndexTable,
    useIndexResourceState,
    Card,
    useBreakpoints,
} from "@shopify/polaris";
import { useBundlesStore } from "@/lib/stores/bundlesStore";
import { useBundleTableActions } from "@/hooks/useBundleTableActions";
import { BundleIndexFilters } from "./BundleIndexFilters";
import { BundleTableRow } from "./BundleTableRow";
import { BundleTableEmptyStates } from "./BundleTableEmptyStates";
import { BundlePagination } from "./BundlePagination";

export function BundleTable() {
    const breakpoints = useBreakpoints();
    const {
        getPaginatedBundles,
        getTotalBundlesCount,
        getFilteredBundles,
        showToast,
    } = useBundlesStore();

    const paginatedBundles = getPaginatedBundles();
    const totalBundles = getTotalBundlesCount();
    const filteredBundles = getFilteredBundles();

    // Selection state
    const resourceIDResolver = (bundle: any) => bundle.id;
    const { selectedResources, allResourcesSelected, handleSelectionChange, clearSelection } =
        useIndexResourceState(paginatedBundles, { resourceIDResolver });

    // Get selected bundle for single selection
    const selectedBundle = selectedResources.length === 1
        ? paginatedBundles.find(bundle => bundle.id === selectedResources[0])
        : null;

    // Actions hook
    const { getPromotedBulkActions, getBulkActions } = useBundleTableActions();

    // Handle clear selection
    const handleClearSelection = useCallback(() => {
        if (clearSelection) {
            clearSelection();
            showToast("Selection cleared");
        }
    }, [clearSelection, showToast]);

    // Get bulk actions with clear selection button
    const promotedBulkActions = selectedResources.length > 0 ? [
        ...getPromotedBulkActions(selectedResources, selectedBundle),
        { content: "Cancel", onAction: handleClearSelection },
    ] : [];

    const bulkActions = getBulkActions(selectedResources, selectedBundle);

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
                resourceName={{ singular: 'bundle', plural: 'bundles' }}
                itemCount={paginatedBundles.length}
                selectedItemsCount={allResourcesSelected ? 'All' : selectedResources.length}
                onSelectionChange={handleSelectionChange}
                promotedBulkActions={promotedBulkActions}
                bulkActions={bulkActions}
                headings={[
                    { title: 'Bundle' },
                    { title: 'Type' },
                    { title: 'Status' },
                    { title: 'Revenue' },
                    { title: 'Views' },
                    { title: 'Products' },
                ]}
                selectable
            >
                {rowMarkup}
            </IndexTable>
            <BundlePagination />
        </Card>
    );
}