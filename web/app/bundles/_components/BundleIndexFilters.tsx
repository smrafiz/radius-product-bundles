import { useCallback } from "react";
import {
    IndexFilters,
    useSetIndexFiltersMode,
    ChoiceList,
    IndexFiltersMode,
} from "@shopify/polaris";
import { useBundleListingStore } from "@/stores";
import type { IndexFiltersProps, TabProps } from "@shopify/polaris";

export function BundleIndexFilters() {
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
        { label: "Frequently Bought Together", value: "FREQUENTLY_BOUGHT_TOGETHER" },
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
                    choices={[
                        { label: "Active", value: "ACTIVE" },
                        { label: "Draft", value: "DRAFT" },
                        { label: "Paused", value: "PAUSED" },
                        { label: "Scheduled", value: "SCHEDULED" },
                        { label: "Archived", value: "ARCHIVED" },
                    ]}
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
                    choices={bundleTypeOptions}
                    selected={filters.typeFilter}
                    onChange={setTypeFilter}
                    allowMultiple
                />
            ),
            shortcut: true,
        },
    ];

    // Applied filters
    const appliedFilters: IndexFiltersProps["appliedFilters"] = [];

    if (filters.statusFilter.length > 0) {
        appliedFilters.push({
            key: "bundleStatus",
            label: `Status: ${filters.statusFilter.join(", ")}`,
            onRemove: () => setStatusFilter([]),
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
            onRemove: () => setTypeFilter([]),
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
        />
    );
}
