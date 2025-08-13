import React, { useCallback, useEffect } from "react";
import {
    Card,
    IndexTable,
    useBreakpoints,
    useIndexResourceState,
} from "@shopify/polaris";
import { BundleTableRow } from "./BundleTableRow";
import { BundlePagination } from "./BundlePagination";
import { useAppBridge } from "@shopify/app-bridge-react";
import { BundleIndexFilters } from "./BundleIndexFilters";
import { useBundlesStore } from "@/lib/stores/bundlesStore";
import { BundleTableEmptyStates } from "./BundleTableEmptyStates";
import { useBundleTableActions } from "@/hooks/useBundleTableActions";

export function BundleTable() {
    const breakpoints = useBreakpoints();
    const app = useAppBridge();
    const {
        getPaginatedBundles,
        getTotalBundlesCount,
        getFilteredBundles,
        fetchBundles,
        showToast,
    } = useBundlesStore();

    const paginatedBundles = getPaginatedBundles();
    const totalBundles = getTotalBundlesCount();
    const filteredBundles = getFilteredBundles();

    // Fetch bundles on mount
    useEffect(() => {
        let mounted = true;
        const loadBundles = async () => {
            try {
                const token = await app.idToken();
                if (!mounted) return;
                await fetchBundles(token);
            } catch (err) {
                console.error("Failed to fetch bundles:", err);
                showToast("Failed to load bundles");
            }
        };
        loadBundles();
        return () => {
            mounted = false;
        };
    }, [app, fetchBundles, showToast]);

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

    // Actions hook
    const { getPromotedBulkActions, getBulkActions } = useBundleTableActions();

    // Handle clear selection
    const handleClearSelection = useCallback(() => {
        if (clearSelection) {
            clearSelection();
            showToast("Selection cleared");
        }
    }, [clearSelection, showToast]);

    // Bulk actions
    const promotedBulkActions =
        selectedResources.length > 0
            ? [
                  ...getPromotedBulkActions(selectedResources, selectedBundle),
                  { content: "Cancel", onAction: handleClearSelection },
              ]
            : [];
    const bulkActions = getBulkActions(selectedResources, selectedBundle);

    // Empty state
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
                    { title: "Bundle" },
                    { title: "Type" },
                    { title: "Status" },
                    { title: "Revenue" },
                    { title: "Views" },
                    { title: "Products" },
                ]}
                selectable
            >
                {rowMarkup}
            </IndexTable>
            <BundlePagination />
        </Card>
    );
}
