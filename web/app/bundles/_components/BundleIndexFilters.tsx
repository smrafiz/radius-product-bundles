import type { IndexFiltersProps, TabProps } from "@shopify/polaris";
import {
    ChoiceList,
    IndexFilters,
    IndexFiltersMode,
    useSetIndexFiltersMode,
} from "@shopify/polaris";
import React, { useCallback } from "react";
import { useBundlesStore } from "@/lib/stores/bundlesStore";
import { useAppBridge } from "@shopify/app-bridge-react";

export function BundleIndexFilters() {
    const app = useAppBridge();
    const {
        filters,
        setSearch,
        setStatusFilter,
        setTypeFilter,
        setSelectedTab,
        setSortSelected,
        clearFilters,
        debouncedFetchBundles, // <-- use this
    } = useBundlesStore();

    const { mode, setMode } = useSetIndexFiltersMode();

    // Fixed tabs
    const itemStrings = [
        "All",
        "Active",
        "Draft",
        "Paused",
        "Scheduled",
        "Archived",
    ];
    const tabs: TabProps[] = itemStrings.map((item, index) => ({
        content: item,
        index,
        onAction: () => {},
        id: `${item}-${index}`,
        isLocked: true,
        actions: [],
    }));

    // Bundle type options
    const bundleTypeOptions = [
        { label: "Buy X Get Y", value: "BUY_X_GET_Y" },
        { label: "BOGO", value: "BOGO" },
        { label: "Volume Discount", value: "VOLUME_DISCOUNT" },
        { label: "Mix & Match", value: "MIX_MATCH" },
        { label: "Cross Sell", value: "CROSS_SELL" },
        { label: "Tiered", value: "TIERED" },
        { label: "Flash Sale", value: "FLASH_SALE" },
        { label: "Gift", value: "GIFT" },
    ];

    // Sort options
    const sortOptions: IndexFiltersProps["sortOptions"] = [
        { label: "Name", value: "name asc", directionLabel: "A-Z" },
        { label: "Name", value: "name desc", directionLabel: "Z-A" },
        { label: "Revenue", value: "revenue asc", directionLabel: "Ascending" },
        {
            label: "Revenue",
            value: "revenue desc",
            directionLabel: "Descending",
        },
        { label: "Views", value: "views asc", directionLabel: "Ascending" },
        { label: "Views", value: "views desc", directionLabel: "Descending" },
        {
            label: "Created",
            value: "created_at asc",
            directionLabel: "Oldest first",
        },
        {
            label: "Created",
            value: "created_at desc",
            directionLabel: "Newest first",
        },
    ];

    // Handlers with debounced fetch
    const handleQueryChange = useCallback(
        (value: string) => {
            setSearch(value);
            app.idToken().then((token) => debouncedFetchBundles(token));
        },
        [setSearch, debouncedFetchBundles, app],
    );

    const handleQueryClear = useCallback(() => {
        setSearch("");
        app.idToken().then((token) => debouncedFetchBundles(token));
    }, [setSearch, debouncedFetchBundles, app]);

    const handleStatusFilterChange = useCallback(
        (selected: string[]) => {
            setStatusFilter(selected);
            app.idToken().then((token) => debouncedFetchBundles(token));
        },
        [setStatusFilter, debouncedFetchBundles, app],
    );

    const handleTypeFilterChange = useCallback(
        (selected: string[]) => {
            setTypeFilter(selected);
            app.idToken().then((token) => debouncedFetchBundles(token));
        },
        [setTypeFilter, debouncedFetchBundles, app],
    );

    const handleTabChange = useCallback(
        (selectedTab: number) => {
            setSelectedTab(selectedTab);
            app.idToken().then((token) => debouncedFetchBundles(token));
        },
        [setSelectedTab, debouncedFetchBundles, app],
    );

    const handleSortChange = useCallback(
        (sortSelected: string[]) => {
            setSortSelected(sortSelected);
            app.idToken().then((token) => debouncedFetchBundles(token));
        },
        [setSortSelected, debouncedFetchBundles, app],
    );

    const handleCancel = useCallback(
        () => setMode("default" as IndexFiltersMode),
        [setMode],
    );

    const filterConfigs = [
        {
            key: "bundleStatus",
            label: "Status",
            filter: (
                <ChoiceList
                    title="Bundle status"
                    choices={[
                        { label: "Active", value: "ACTIVE" },
                        { label: "Draft", value: "DRAFT" },
                        { label: "Paused", value: "PAUSED" },
                        { label: "Scheduled", value: "SCHEDULED" },
                        { label: "Archived", value: "ARCHIVED" },
                    ]}
                    selected={filters.statusFilter}
                    onChange={handleStatusFilterChange}
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
                    choices={bundleTypeOptions}
                    selected={filters.typeFilter}
                    onChange={handleTypeFilterChange}
                    allowMultiple
                />
            ),
            shortcut: true,
        },
    ];

    const appliedFilters: IndexFiltersProps["appliedFilters"] = [];
    if (filters.statusFilter.length > 0) {
        appliedFilters.push({
            key: "bundleStatus",
            label: `Status: ${filters.statusFilter.join(", ")}`,
            onRemove: () => handleStatusFilterChange([]),
        });
    }
    if (filters.typeFilter.length > 0) {
        const typeLabels = filters.typeFilter.map((val) => {
            const option = bundleTypeOptions.find((opt) => opt.value === val);
            return option ? option.label : val;
        });
        appliedFilters.push({
            key: "bundleType",
            label: `Bundle type: ${typeLabels.join(", ")}`,
            onRemove: () => handleTypeFilterChange([]),
        });
    }

    return (
        <IndexFilters
            sortOptions={sortOptions}
            sortSelected={filters.sortSelected}
            queryValue={filters.search}
            queryPlaceholder="Search bundles..."
            onQueryChange={handleQueryChange}
            onQueryClear={handleQueryClear}
            onSort={handleSortChange}
            primaryAction={undefined}
            cancelAction={{
                onAction: handleCancel,
                disabled: false,
                loading: false,
            }}
            tabs={tabs}
            selected={filters.selectedTab}
            onSelect={handleTabChange}
            canCreateNewView={false}
            filters={filterConfigs}
            appliedFilters={appliedFilters}
            onClearAll={() => {
                clearFilters();
                app.idToken().then((token) => debouncedFetchBundles(token));
            }}
            mode={mode}
            setMode={setMode}
        />
    );
}
