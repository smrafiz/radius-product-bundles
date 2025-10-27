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
    BundleStatus,
    useBundleFilters,
} from "@/features/bundles";
import { useCallback } from "react";
import { BundleType } from "@prisma/client";
import type { IndexFiltersProps } from "@shopify/polaris";

/**
 * Bundle index filters
 */
export function BundleIndexFilters({ loading }: { loading?: boolean }) {
    const { mode, setMode } = useSetIndexFiltersMode();
    const {
        filters,
        queryValue,
        setQueryValue,
        setSearch,
        setStatusFilter,
        setTypeFilter,
        setSelectedTab,
        setSortSelected,
        clearFilters,
    } = useBundleFilters();

    const tabs = BUNDLE_FILTERS.tabs.items.map((item, index) => ({
        content: item,
        index,
        id: `${item}-${index}`,
        isLocked: true,
    }));

    const handleQueryClear = () => {
        setQueryValue("");
        setSearch("");
    };

    const handleCancel = useCallback(() => {
        setMode("DEFAULT" as IndexFiltersMode);
    }, [setMode]);

    const filterConfigs = [
        {
            key: BUNDLE_FILTERS.status.key,
            label: BUNDLE_FILTERS.status.label,
            filter: (
                <ChoiceList
                    titleHidden
                    title={BUNDLE_FILTERS.status.label}
                    choices={BUNDLE_FILTERS.status.options}
                    selected={filters.statusFilter as BundleStatus[]}
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
                    titleHidden
                    title={BUNDLE_FILTERS.type.label}
                    choices={BUNDLE_FILTERS.type.options}
                    selected={filters.typeFilter as BundleType[]}
                    onChange={setTypeFilter}
                    allowMultiple
                />
            ),
            shortcut: true,
        },
    ];

    const appliedFilters: IndexFiltersProps["appliedFilters"] = [];

    if (filters.statusFilter && filters.statusFilter.length > 0) {
        const statusLabels = filters.statusFilter.map(
            (val) => BUNDLE_STATUS_FILTER_OPTIONS.find((opt) => opt.value === val)?.label ?? val
        );
        appliedFilters.push({
            key: "bundleStatus",
            label: `Status: ${statusLabels.join(", ")}`,
            onRemove: () => setStatusFilter([]),
        });
    }

    if (filters.typeFilter && filters.typeFilter.length > 0) {
        const typeLabels = filters.typeFilter.map(
            (val) => BUNDLE_TYPE_FILTER_OPTIONS.find((opt) => opt.value === val)?.label ?? val
        );
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
            onQueryChange={setQueryValue}
            onQueryClear={handleQueryClear}
            onSort={setSortSelected}
            cancelAction={{ onAction: handleCancel }}
            tabs={tabs}
            selected={filters.selectedTab as number}
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