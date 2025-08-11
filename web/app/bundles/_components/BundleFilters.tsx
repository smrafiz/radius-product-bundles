import React from "react";
import { SearchIcon } from "@shopify/polaris-icons";
import { useBundlesStore } from "@/lib/stores/bundlesStore";
import { Box, Card, InlineStack, Select, TextField } from "@shopify/polaris";

const bundleTypeOptions = [
    { label: "All bundles", value: "all" },
    { label: "Buy X Get Y", value: "BUY_X_GET_Y" },
    { label: "BOGO", value: "BOGO" },
    { label: "Volume Discount", value: "VOLUME_DISCOUNT" },
    { label: "Mix & Match", value: "MIX_MATCH" },
    { label: "Cross Sell", value: "CROSS_SELL" },
    { label: "Tiered", value: "TIERED" },
    { label: "Flash Sale", value: "FLASH_SALE" },
    { label: "Gift", value: "GIFT" },
];

const statusOptions = [
    { label: "All statuses", value: "all" },
    { label: "Active", value: "ACTIVE" },
    { label: "Draft", value: "DRAFT" },
    { label: "Paused", value: "PAUSED" },
    { label: "Scheduled", value: "SCHEDULED" },
    { label: "Archived", value: "ARCHIVED" },
];

export function BundleFilters() {
    const { filters, setSearchValue, setTypeFilter, setStatusFilter } =
        useBundlesStore();

    return (
        <Card>
            <Box padding="400">
                <InlineStack gap="300" align="start">
                    <Box minWidth="300px">
                        <TextField
                            value={filters.search}
                            onChange={setSearchValue}
                            placeholder="Search bundles..."
                            prefix={<SearchIcon />}
                            autoComplete="off"
                            label=""
                            labelHidden
                        />
                    </Box>
                    <Select
                        label="Bundle Type"
                        labelHidden
                        options={bundleTypeOptions}
                        value={filters.typeFilter}
                        onChange={setTypeFilter}
                    />
                    <Select
                        label="Status"
                        labelHidden
                        options={statusOptions}
                        value={filters.statusFilter}
                        onChange={setStatusFilter}
                    />
                </InlineStack>
            </Box>
        </Card>
    );
}
