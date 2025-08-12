import React from "react";
import { IndexTable, useIndexResourceState } from "@shopify/polaris";
import { useBundlesStore } from "@/lib/stores/bundlesStore";
import { useBundleTableActions } from "@/hooks/useBundleTableActions";
import { BundleTableRow } from "./BundleTableRow";
import { BundleTableEmptyStates } from "./BundleTableEmptyStates";

export function BundleTable() {
    const {
        getFilteredBundles,
        getTotalBundlesCount,
        showToast,
    } = useBundlesStore();

    const filteredBundles = getFilteredBundles();
    const totalBundles = getTotalBundlesCount();

    // Selection state
    const resourceIDResolver = (bundle: any) => bundle.id;
    const { selectedResources, allResourcesSelected, handleSelectionChange, clearSelection } =
        useIndexResourceState(filteredBundles, {
            resourceIDResolver,
        });

    // Get selected bundle for single selection
    const selectedBundle = selectedResources.length === 1
        ? filteredBundles.find(bundle => bundle.id === selectedResources[0])
        : null;

    // Actions hook
    const { getPromotedBulkActions, getBulkActions } = useBundleTableActions();

    // Handle clear selection
    const handleClearSelection = () => {
        if (clearSelection) {
            clearSelection();
            showToast("Selection cleared");
        }
    };

    // Get bulk actions with clear selection button
    const promotedBulkActions = selectedResources.length > 0 ? [
        ...getPromotedBulkActions(selectedResources, selectedBundle),
        {
            content: "Unselect all",
            onAction: handleClearSelection,
        },
    ] : [];

    const bulkActions = getBulkActions(selectedResources, selectedBundle);

    // Check for empty states
    const emptyState = (
        <BundleTableEmptyStates 
            totalBundles={totalBundles}
            filteredBundlesCount={filteredBundles.length}
        />
    );

    if (totalBundles === 0 || filteredBundles.length === 0) {
        return emptyState;
    }

    // Render table rows
    const rowMarkup = filteredBundles.map((bundle, index) => (
        <BundleTableRow
            key={bundle.id}
            bundle={bundle}
            index={index}
            isSelected={selectedResources.includes(bundle.id)}
        />
    ));

    return (
        <IndexTable
            resourceName={{
                singular: 'bundle',
                plural: 'bundles',
            }}
            itemCount={filteredBundles.length}
            selectedItemsCount={
                allResourcesSelected ? 'All' : selectedResources.length
            }
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
    );
}