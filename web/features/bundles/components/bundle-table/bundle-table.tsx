"use client";

import {
    BundleBulkActionsBar,
    BundleIndexFilters,
    BundlePagination,
    BundleTableEmptyStates,
    BundleTableHeader,
    BundleTableRow,
    useBundleListingStore,
    useBundlesData,
    useBundleSelection,
} from "@/features/bundles";

/*
 * Bundle table components
 */
export function BundleTable() {
    const bundles = useBundleListingStore((s) => s.bundles);
    const pagination = useBundleListingStore((s) => s.pagination);
    const filters = useBundleListingStore((s) => s.filters);
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
        (filters.statusFilter?.length ?? 0) > 0 ||
        (filters.selectedTab ?? 0) > 0;

    if (safeBundles.length === 0) {
        return (
            <s-box background="base" borderRadius="large" border="base">
                <BundleIndexFilters
                    loading={isFetching}
                    hasSelection={hasSelection}
                />
                <BundleTableEmptyStates
                    totalBundles={hasActiveFilters ? 1 : pagination.totalItems}
                    filteredBundlesCount={pagination.totalItems}
                />
                <BundlePagination />
            </s-box>
        );
    }

    return (
        <s-box background="base" borderRadius="large" border="base">
            <BundleIndexFilters
                loading={isFetching}
                hasSelection={hasSelection}
            />

            <div className="relative overflow-hidden">
                {hasSelection && (
                    <BundleBulkActionsBar
                        selectedResources={selectedResources}
                        selectedBundle={selectedBundle}
                        allResourcesSelected={allResourcesSelected}
                        toggleAllSelection={toggleAllSelection}
                        clearSelection={clearSelection}
                    />
                )}

                <s-table loading={isFetching}>
                    <BundleTableHeader
                        selectedResources={selectedResources}
                        allResourcesSelected={allResourcesSelected}
                        toggleAllSelection={toggleAllSelection}
                    />

                    <s-table-body>
                        {safeBundles.map((bundle) => (
                            <BundleTableRow
                                key={bundle.id}
                                bundle={bundle}
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
    );
}
