"use client";

import {
    ChoiceList,
    IndexFilters,
    IndexFiltersMode,
    useSetIndexFiltersMode,
} from "@shopify/polaris";
import {
    BUNDLE_FILTERS,
    BUNDLE_SORT_OPTIONS,
    BUNDLE_STATUS_FILTER_OPTIONS,
    BUNDLE_TYPE_FILTER_OPTIONS,
    useBundleListingStore,
} from "@/features/bundles";
import { useDebounce } from "@/shared";
import { useCallback, useEffect, useState } from "react";
import type { IndexFiltersProps } from "@shopify/polaris";

export function BundleIndexFilters({ loading }: { loading?: boolean }) {
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
    const debouncedQuery = useDebounce(
        queryValue,
        BUNDLE_FILTERS.search.debounceMs,
    );

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
    const tabs = BUNDLE_FILTERS.tabs.items.map((item, index) => ({
        content: item,
        index,
        onAction: () => {},
        id: `${item}-${index}`,
        isLocked: true,
        actions: [],
    }));

    // Filter handlers
    const handleQueryChange = useCallback((value: string) => {
        setQueryValue(value);
    }, []);

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
            key: BUNDLE_FILTERS.status.key,
            label: BUNDLE_FILTERS.status.label,
            filter: (
                <ChoiceList
                    title={BUNDLE_FILTERS.status.label}
                    titleHidden
                    choices={BUNDLE_FILTERS.status.options}
                    selected={filters.statusFilter}
                    onChange={setStatusFilter}
                    allowMultiple
                />
            ),
            shortcut: true,
        },
        {
            key: BUNDLE_FILTERS.type.key,
            label: BUNDLE_FILTERS.type.label,
            filter: (
                <ChoiceList
                    title={BUNDLE_FILTERS.type.label}
                    titleHidden
                    choices={BUNDLE_FILTERS.type.options}
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
            const option = BUNDLE_STATUS_FILTER_OPTIONS.find(
                (opt) => opt.value === val,
            );
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
            const option = BUNDLE_TYPE_FILTER_OPTIONS.find(
                (opt) => opt.value === val,
            );
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
            sortOptions={BUNDLE_SORT_OPTIONS}
            sortSelected={filters.sortSelected}
            queryValue={queryValue}
            queryPlaceholder={BUNDLE_FILTERS.search.placeholder}
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
