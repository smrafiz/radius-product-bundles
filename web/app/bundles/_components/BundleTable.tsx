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

import {
    useBundleActions,
    useBundlesData,
    useBundleTableBulkActions,
} from "@/hooks";
import { useBundleListingStore } from "@/stores";

export default function BundleTable() {
    const breakpoints = useBreakpoints();
    const {
        bundles,
        pagination,
        showToast,
    } = useBundleListingStore();
    const { isFetching } = useBundlesData();
    const { loading } = useBundleListingStore();

    const totalBundles = pagination.totalItems;

    // Selection state
    const resourceIDResolver = (bundle: any) => bundle.id;
    const {
        selectedResources,
        allResourcesSelected,
        handleSelectionChange,
        clearSelection,
    } = useIndexResourceState(bundles, { resourceIDResolver });

    // Get selected bundle for single selection
    const selectedBundle =
        selectedResources.length === 1
            ? bundles.find(
                  (bundle) => bundle.id === selectedResources[0],
              )
            : null;

    const { actions: selectedBundleActions } = useBundleActions(
        selectedBundle || (bundles.length > 0 ? bundles[0] : null)
    );

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
    if (totalBundles === 0 || bundles.length === 0) {
        return (
            <Card padding="0">
                <BundleIndexFilters />
                <BundleTableEmptyStates
                    totalBundles={totalBundles}
                    filteredBundlesCount={bundles.length}
                />
            </Card>
        );
    }

    // Render table rows
    const rowMarkup = bundles.map((bundle, index) => (
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
                itemCount={bundles.length}
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
