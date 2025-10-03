"use client";

import { useCallback, useState, useEffect } from "react";
import {
    IndexFilters,
    useSetIndexFiltersMode,
    ChoiceList,
    IndexFiltersMode,
} from "@shopify/polaris";
import { useBundleListingStore } from "@/stores";
import type { IndexFiltersProps } from "@shopify/polaris";
import {
    bundleStatusFilterOptions,
    bundleTypeFilterOptions,
    bundleSortOptions,
    bundleFiltersConfig,
} from "@/config";
import { useDebounce } from "@/hooks";

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

    // Local state for immediate UI update
    const [queryValue, setQueryValue] = useState(filters.search);

    // Debounce the search query
    const debouncedQuery = useDebounce(queryValue, bundleFiltersConfig.search.debounceMs);

    // Update store when debounced value changes
    useEffect(() => {
        setSearch(debouncedQuery);
    }, [debouncedQuery, setSearch]);

    // Sync with store when cleared externally
    useEffect(() => {
        if (filters.search === "" && queryValue !== "") {
            setQueryValue("");
        }
    }, [filters.search]);

    // Tabs from config
    const tabs = bundleFiltersConfig.tabs.items.map((item, index) => ({
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
            setQueryValue(value);
        },
        [],
    );

    const handleQueryClear = useCallback(() => {
        setQueryValue("");
        setSearch("");
    }, [setSearch]);

    const handleCancel = useCallback(() => {
        setMode("DEFAULT" as IndexFiltersMode);
    }, [setMode]);

    // Filter configuration
    const filterConfigs = [
        {
            key: bundleFiltersConfig.status.key,
            label: bundleFiltersConfig.status.label,
            filter: (
                <ChoiceList
                    title={bundleFiltersConfig.status.label}
                    titleHidden
                    choices={bundleFiltersConfig.status.options}
                    selected={filters.statusFilter}
                    onChange={setStatusFilter}
                    allowMultiple
                />
            ),
            shortcut: true,
        },
        {
            key: bundleFiltersConfig.type.key,
            label: bundleFiltersConfig.type.label,
            filter: (
                <ChoiceList
                    title={bundleFiltersConfig.type.label}
                    titleHidden
                    choices={bundleFiltersConfig.type.options}
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
            queryValue={queryValue}
            queryPlaceholder={bundleFiltersConfig.search.placeholder}
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