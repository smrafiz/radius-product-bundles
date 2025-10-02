"use client";

import { useCallback } from "react";
import {
    IndexFilters,
    useSetIndexFiltersMode,
    ChoiceList,
    IndexFiltersMode,
} from "@shopify/polaris";
import { useBundleListingStore } from "@/stores";
import type { IndexFiltersProps, TabProps } from "@shopify/polaris";
import {
    bundleStatusFilterOptions,
    bundleTypeFilterOptions,
    bundleSortOptions,
    bundleTabStrings,
} from "@/config/bundleFilters.config";

export default function BundleIndexFilters({ loading }: { loading?: boolean }) {
    const {
        filters,
        setSearch,
        setStatusFilter,
        setTypeFilter,
        setSelectedTab,
        setSortSelected,
        clearFilters,
    } = useBundleListingStore();

    const { mode, setMode } = useSetIndexFiltersMode();

    // Tabs from config
    const tabs: TabProps[] = bundleTabStrings.map((item, index) => ({
        content: item,
        index,
        onAction: () => {},
        id: `${item}-${index}`,
        isLocked: true,
        actions: [],
    }));

    // Filter handlers
    const handleQueryChange = useCallback(
        (value: string) => {
            setSearch(value);
        },
        [setSearch],
    );

    const handleQueryClear = useCallback(() => {
        setSearch("");
    }, [setSearch]);

    const handleCancel = useCallback(() => {
        setMode("DEFAULT" as IndexFiltersMode);
    }, [setMode]);

    // Filter configuration
    const filterConfigs = [
        {
            key: "bundleStatus",
            label: "Status",
            filter: (
                <ChoiceList
                    title="Bundle status"
                    titleHidden
                    choices={bundleStatusFilterOptions}
                    selected={filters.statusFilter}
                    onChange={setStatusFilter}
                    allowMultiple
                />
            ),
            shortcut: true,
        },
        {
            key: "bundleType",
            label: "Bundle type",
            filter: (
                <ChoiceList
                    title="Bundle type"
                    titleHidden
                    choices={bundleTypeFilterOptions}
                    selected={filters.typeFilter}
                    onChange={setTypeFilter}
                    allowMultiple
                />
            ),
            shortcut: true,
        },
    ];

    // Applied filters with proper labels from config
    const appliedFilters: IndexFiltersProps["appliedFilters"] = [];

    if (filters.statusFilter.length > 0) {
        const statusLabels = filters.statusFilter.map((val) => {
            const option = bundleStatusFilterOptions.find((opt) => opt.value === val);
            return option ? option.label : val;
        });
        appliedFilters.push({
            key: "bundleStatus",
            label: `Status: ${statusLabels.join(", ")}`,
            onRemove: () => setStatusFilter([]),
        });
    }

    if (filters.typeFilter.length > 0) {
        const typeLabels = filters.typeFilter.map((val) => {
            const option = bundleTypeFilterOptions.find((opt) => opt.value === val);
            return option ? option.label : val;
        });
        appliedFilters.push({
            key: "bundleType",
            label: `Type: ${typeLabels.join(", ")}`,
            onRemove: () => setTypeFilter([]),
        });
    }

    return (
        <IndexFilters
            sortOptions={bundleSortOptions}
            sortSelected={filters.sortSelected}
            queryValue={filters.search}
            queryPlaceholder="Search bundles..."
            onQueryChange={handleQueryChange}
            onQueryClear={handleQueryClear}
            onSort={setSortSelected}
            primaryAction={undefined}
            cancelAction={{
                onAction: handleCancel,
                disabled: false,
                loading: false,
            }}
            tabs={tabs}
            selected={filters.selectedTab}
            onSelect={setSelectedTab}
            canCreateNewView={false}
            filters={filterConfigs}
            appliedFilters={appliedFilters}
            onClearAll={clearFilters}
            mode={mode}
            setMode={setMode}
            loading={loading || false}
        />
    );
}