// "use client";
//
// import {
//     BundleIndexFilters,
//     BundlePagination,
//     BundleTableEmptyStates,
//     BundleTableRow,
//     useBundleActions,
//     useBundleListingStore,
//     useBundlesData,
//     useBundleSelection,
//     useBundleTableBulkActions,
// } from "@/features/bundles";
// import { useCallback } from "react";
// import { Card, IndexTable, useBreakpoints } from "@shopify/polaris";
//
// /**
//  * Bundle table
//  */
// export function BundleTable() {
//     const breakpoints = useBreakpoints();
//     const { bundles, pagination, filters, showToast } = useBundleListingStore();
//     const { isFetching } = useBundlesData();
//     const safeBundles = Array.isArray(bundles) ? bundles : [];
//     const {
//         selectedResources,
//         clearSelection,
//         selectedBundle,
//         allResourcesSelected,
//         handleSelectionChange,
//     } = useBundleSelection(safeBundles);
//
//     // Check if any filters are active
//     const hasActiveFilters =
//         filters.search !== "" ||
//         (filters.statusFilter as string[]).length > 0 ||
//         (filters.selectedTab as number) > 0;
//
//     // For empty state logic
//     const totalBundles = pagination.totalItems;
//
//     const { actions: selectedBundleActions } = useBundleActions(
//         selectedBundle || (safeBundles.length > 0 ? safeBundles[0] : null),
//         clearSelection,
//     );
//
//     const { getPromotedBulkActions, getBulkActions } =
//         useBundleTableBulkActions(clearSelection);
//
//     // Handle clear selection
//     const handleClearSelection = useCallback(() => {
//         if (clearSelection) {
//             clearSelection();
//             showToast("Selection cleared");
//         }
//     }, [clearSelection, showToast]);
//
//     const promotedBulkActions =
//         selectedResources.length > 0
//             ? [
//                   ...getPromotedBulkActions(
//                       selectedResources,
//                       selectedBundle,
//                       selectedBundleActions,
//                   ),
//                   { content: "Cancel", onAction: handleClearSelection },
//               ]
//             : [];
//
//     const bulkActions = getBulkActions(
//         selectedResources,
//         selectedBundle,
//         selectedBundleActions,
//     );
//
//     // Check for empty states
//     if (safeBundles.length === 0) {
//         return (
//             <s-box background="base" borderRadius="large" border="base">
//                 <BundleIndexFilters loading={isFetching} />
//                 <BundleTableEmptyStates
//                     totalBundles={hasActiveFilters ? 1 : totalBundles}
//                     filteredBundlesCount={totalBundles}
//                 />
//                 <BundlePagination />
//             </s-box>
//         );
//     }
//
//     // Render table rows
//     const rowMarkup = safeBundles.map((bundle, index) => (
//         <BundleTableRow
//             key={bundle.id}
//             bundle={bundle}
//             index={index}
//             isSelected={selectedResources.includes(bundle.id)}
//         />
//     ));
//
//     return (
//         <s-box background="base" border="base" borderRadius="large" overflow="hidden">
//             <BundleIndexFilters loading={isFetching} />
//             <IndexTable
//                 condensed={breakpoints.smDown}
//                 resourceName={{ singular: "bundle", plural: "bundles" }}
//                 itemCount={safeBundles.length}
//                 selectedItemsCount={
//                     allResourcesSelected ? "All" : selectedResources.length
//                 }
//                 onSelectionChange={handleSelectionChange}
//                 promotedBulkActions={promotedBulkActions}
//                 bulkActions={bulkActions}
//                 headings={[
//                     { title: "Bundle Name" },
//                     { title: "Bundled Products" },
//                     { title: "Type" },
//                     { title: "Discount" },
//                     { title: "Status" },
//                     { title: "Actions", alignment: "center" },
//                 ]}
//                 selectable
//             >
//                 {rowMarkup}
//             </IndexTable>
//             <BundlePagination />
//         </s-box>
//     );
// }

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

/**
 * Bundle table with web components
 */
export function BundleTable() {
    const { bundles, pagination, filters, showToast } = useBundleListingStore();
    const { isFetching } = useBundlesData();
    const safeBundles = Array.isArray(bundles) ? bundles : [];

    const {
        selectedResources,
        clearSelection,
        selectedBundle,
        allResourcesSelected,
        toggleSelection,
        toggleAllSelection,
    } = useBundleSelection(safeBundles);

    const hasActiveFilters =
        filters.search !== "" ||
        (filters.statusFilter as string[]).length > 0 ||
        (filters.selectedTab as number) > 0;

    const totalBundles = pagination.totalItems;

    const { actions: selectedBundleActions } = useBundleActions(
        selectedBundle || (safeBundles.length > 0 ? safeBundles[0] : null),
        clearSelection,
    );

    const { getPromotedBulkActions, getBulkActions } =
        useBundleTableBulkActions(clearSelection);

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

    if (safeBundles.length === 0) {
        return (
            <s-box
                background="base"
                borderRadius="large"
                border="base"
                overflow="hidden"
            >
                <BundleIndexFilters loading={isFetching} />
                <BundleTableEmptyStates
                    totalBundles={hasActiveFilters ? 1 : totalBundles}
                    filteredBundlesCount={totalBundles}
                />
                <BundlePagination />
            </s-box>
        );
    }

    // Render bulk actions bar
    const bulkActionsMarkup = selectedResources.length > 0 && (
        <div className="absolute z-10 top-[1px]">
            <s-box
                paddingInline="small"
                paddingBlock="small"
                background="base"
                borderRadius="large"
            >
                <s-stack direction="inline" gap="base" alignItems="center">
                    <s-stack direction="inline">
                        <s-text>
                            {allResourcesSelected
                                ? `All ${safeBundles.length} bundles selected`
                                : `${selectedResources.length} selected`}
                        </s-text>
                    </s-stack>

                    <s-stack direction="inline" gap="small-200">
                        {promotedBulkActions.map((action, index) => (
                            <s-button
                                key={index}
                                variant={index === 0 ? "primary" : "secondary"}
                                onClick={() => action.onAction?.()}
                            >
                                {action.content}
                            </s-button>
                        ))}

                        {bulkActions.length > 0 && (
                            <s-stack direction="inline">
                                <s-button
                                    variant="secondary"
                                    commandFor="bulk-actions-popover"
                                    icon="menu-horizontal"
                                    accessibilityLabel="More actions"
                                />
                                <s-popover id="bulk-actions-popover">
                                    <s-box padding="small">
                                        <s-stack gap="small-100">
                                            {bulkActions.map(
                                                (action, index) => (
                                                    <s-button
                                                        key={index}
                                                        variant="tertiary"
                                                        onClick={() =>
                                                            action.onAction?.()
                                                        }
                                                    >
                                                        {action.content}
                                                    </s-button>
                                                ),
                                            )}
                                        </s-stack>
                                    </s-box>
                                </s-popover>
                            </s-stack>
                        )}
                    </s-stack>
                </s-stack>
            </s-box>
        </div>
    );

    return (
        <div className="relative">
            <s-box
                background="base"
                borderRadius="large"
                border="base"
                overflow="hidden"
            >
                <BundleIndexFilters loading={isFetching} />
                {bulkActionsMarkup && <s-stack>{bulkActionsMarkup}</s-stack>}

                <s-table loading={isFetching}>
                    {/* Header Row */}
                    <s-table-header-row>
                        <s-table-header listSlot="primary">
                            <s-checkbox
                                checked={allResourcesSelected}
                                onChange={(e: Event) => {
                                    e.stopPropagation();
                                    toggleAllSelection();
                                }}
                            />
                        </s-table-header>

                        <>
                            <s-table-header listSlot="labeled">
                                <s-stack paddingBlock="small-300">
                                    Bundle Name
                                </s-stack>
                            </s-table-header>
                            <s-table-header>
                                <s-stack>Products</s-stack>
                            </s-table-header>
                            <s-table-header>
                                <s-stack>Type</s-stack>
                            </s-table-header>
                            <s-table-header>
                                <s-stack>Discount</s-stack>
                            </s-table-header>
                            <s-table-header>
                                <s-stack>Status</s-stack>
                            </s-table-header>
                            <s-table-header>
                                <s-stack>Actions</s-stack>
                            </s-table-header>
                        </>
                    </s-table-header-row>

                    {/* Table Body */}
                    <s-table-body>
                        {safeBundles.map((bundle, index) => (
                            <BundleTableRow
                                key={bundle.id}
                                bundle={bundle}
                                index={index}
                                isSelected={selectedResources.includes(
                                    bundle.id,
                                )}
                                onToggleSelection={toggleSelection}
                            />
                        ))}
                    </s-table-body>
                </s-table>

                <BundlePagination />
            </s-box>
        </div>
    );
}
