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
export function NewBundleTable() {
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

    // Check if any filters are active
    const hasActiveFilters =
        filters.search !== "" ||
        (filters.statusFilter as string[]).length > 0 ||
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
            <s-card>
                <BundleIndexFilters loading={isFetching} />
                <BundleTableEmptyStates
                    totalBundles={hasActiveFilters ? 1 : totalBundles}
                    filteredBundlesCount={totalBundles}
                />
                <BundlePagination />
            </s-card>
        );
    }

    // Render bulk actions bar
    const bulkActionsMarkup = selectedResources.length > 0 && (
        <s-box
            padding="base"
            style={{
                backgroundColor: "var(--p-color-bg-surface-selected)",
                borderBottom: "1px solid var(--p-color-border)",
            }}
        >
            <s-stack direction="inline" gap="base" alignItems="center">
                <s-text variant="bodyMd" fontWeight="medium">
                    {allResourcesSelected
                        ? `All ${safeBundles.length} bundles selected`
                        : `${selectedResources.length} selected`}
                </s-text>

                <s-stack direction="inline" gap="small-200">
                    {promotedBulkActions.map((action, index) => (
                        <s-button
                            key={index}
                            variant={index === 0 ? "primary" : "secondary"}
                            size="small"
                            onClick={() => action.onAction?.()}
                        >
                            {action.content}
                        </s-button>
                    ))}

                    {bulkActions.length > 0 && (
                        <>
                            <s-button
                                variant="secondary"
                                size="small"
                                commandFor="bulk-actions-popover"
                            >
                                More actions
                            </s-button>
                            <s-popover id="bulk-actions-popover">
                                <s-box padding="small">
                                    <s-stack gap="small-100">
                                        {bulkActions.map((action, index) => (
                                            <s-button
                                                key={index}
                                                variant="tertiary"
                                                onClick={() => action.onAction?.()}
                                                fullWidth
                                            >
                                                {action.content}
                                            </s-button>
                                        ))}
                                    </s-stack>
                                </s-box>
                            </s-popover>
                        </>
                    )}
                </s-stack>
            </s-stack>
        </s-box>
    );

    return (
        <s-card>
            <BundleIndexFilters loading={isFetching} />

            <s-table variant="table">
                {/* Header Row */}
                    {bulkActionsMarkup ? (
                        <s-table-header-row>
                            <s-table-header listSlot="labeled" slot="first-column">
                                <s-checkbox
                                    checked={allResourcesSelected}
                                    onChange={toggleAllSelection}
                                />
                            </s-table-header>
                        <s-table-header listSlot="labeled">
                            {bulkActionsMarkup}
                        </s-table-header>
                        </s-table-header-row>
                    ) : (
                        <s-table-header-row>
                        <s-table-header listSlot="labeled" slot="first-column">
                            <s-checkbox
                                checked={allResourcesSelected}
                                onChange={toggleAllSelection}
                            />
                        </s-table-header>
                        <s-table-header listSlot="primary">
                        Bundle Name
                        </s-table-header>
                        <s-table-header listSlot="labeled">
                        Bundled Products
                        </s-table-header>
                        <s-table-header listSlot="labeled">
                        Type
                        </s-table-header>
                        <s-table-header listSlot="labeled">
                        Discount
                        </s-table-header>
                        <s-table-header listSlot="labeled">
                        Status
                        </s-table-header>
                        <s-table-header listSlot="labeled">
                        Actions
                        </s-table-header>
                        </s-table-header-row>
                    )}

                {/* Table Body */}
                <s-table-body>
                    {safeBundles.map((bundle, index) => (
                        <BundleTableRow
                            key={bundle.id}
                            bundle={bundle}
                            index={index}
                            isSelected={selectedResources.includes(bundle.id)}
                            onToggleSelection={toggleSelection}
                        />
                    ))}
                </s-table-body>
            </s-table>

            <BundlePagination />
        </s-card>
    );
}