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
        selectedBundle,
        clearSelection,
        toggleSelection,
        selectedResources,
        toggleAllSelection,
        allResourcesSelected,
    } = useBundleSelection(safeBundles);

    const hasSelection = selectedResources.length > 0;

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
                <BundleIndexFilters
                    loading={isFetching}
                    hasSelection={hasSelection}
                />
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
        <div className="absolute z-10 top-0 w-full">
            <s-box
                paddingInline="small"
                paddingBlock="small-400"
                background="subdued"
            >
                <s-stack
                    direction="inline"
                    gap="none"
                    alignItems="center"
                    justifyContent="space-between"
                >
                    <s-stack
                        direction="inline"
                        gap="small"
                        alignItems="center"
                    >
                        <s-checkbox
                            indeterminate={
                                selectedResources.length > 0 &&
                                !allResourcesSelected
                            }
                            checked={allResourcesSelected}
                            onChange={(e: Event) => {
                                e.stopPropagation();
                                toggleAllSelection();
                            }}
                        />
                        <s-text>
                            <span className="font-medium">
                                {`${selectedResources.length} selected`}
                            </span>
                        </s-text>
                    </s-stack>

                    <s-stack direction="inline" gap="small-300">
                        {promotedBulkActions.map((action, index) => (
                            <s-button
                                key={index}
                                variant="secondary"
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
                                        <s-stack gap="small-300">
                                            {bulkActions.map(
                                                (action, index) => (
                                                    <s-button
                                                        key={index}
                                                        icon={action.icon}
                                                        variant="tertiary"
                                                        onClick={() => {
                                                            action.onAction?.();
                                                            console.log(
                                                                "hello",
                                                            );
                                                        }}
                                                        tone={
                                                            action.destructive
                                                                ? "critical"
                                                                : "auto"
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
        <>
            <s-box
                background="base"
                borderRadius="large"
                border="base"
                overflow="hidden"
            >
                <BundleIndexFilters
                    loading={isFetching}
                    hasSelection={hasSelection}
                />
                <div className="relative overflow-hidden">
                    {bulkActionsMarkup && (
                        <s-stack>{bulkActionsMarkup}</s-stack>
                    )}

                    <s-table loading={isFetching}>
                        {/* Header Row */}
                        <s-table-header-row>
                            <s-table-header listSlot="primary">
                                <s-stack
                                    direction="inline"
                                    gap="small"
                                    alignItems="center"
                                >
                                    <s-checkbox
                                        indeterminate={
                                            selectedResources.length > 0 &&
                                            !allResourcesSelected
                                        }
                                        checked={allResourcesSelected}
                                        onChange={(e: Event) => {
                                            e.stopPropagation();
                                            toggleAllSelection();
                                        }}
                                    />
                                    <s-stack paddingBlock="small-400">
                                        Bundle Name
                                    </s-stack>
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
                                <s-stack>
                                    <span className="text-center">Actions</span>
                                </s-stack>
                            </s-table-header>
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
                </div>
            </s-box>
        </>
    );
}
