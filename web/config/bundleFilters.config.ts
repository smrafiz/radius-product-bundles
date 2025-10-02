import { bundleStatusConfigs } from "./bundleStatus.config";
import { bundleTypeConfigs } from "./bundleType.config";
import type { IndexFiltersProps } from "@shopify/polaris";

// Bundle status filter options
export const bundleStatusFilterOptions = Object.entries(bundleStatusConfigs).map(
    ([value, config]) => ({
        label: config.text,
        value,
    })
);

// Bundle type filter options
export const bundleTypeFilterOptions = Object.values(bundleTypeConfigs).map(
    (config) => ({
        label: config.label,
        value: config.id,
    })
);

// Sort options configuration
export const bundleSortOptions: IndexFiltersProps["sortOptions"] = [
    { label: "Name", value: "name asc", directionLabel: "A-Z" },
    { label: "Name", value: "name desc", directionLabel: "Z-A" },
    { label: "Revenue", value: "revenue asc", directionLabel: "Low to High" },
    { label: "Revenue", value: "revenue desc", directionLabel: "High to Low" },
    { label: "Views", value: "views asc", directionLabel: "Low to High" },
    { label: "Views", value: "views desc", directionLabel: "High to Low" },
    {
        label: "Created",
        value: "createdAt asc",
        directionLabel: "Oldest first",
    },
    {
        label: "Created",
        value: "createdAt desc",
        directionLabel: "Newest first",
    },
];

// Tab configuration
export const bundleTabStrings = [
    "All",
    "Active",
    "Draft",
    "Paused",
    "Scheduled",
    "Archived",
];

// Map tab index to status filter
export const tabStatusMap = [
    "ALL",
    "ACTIVE",
    "DRAFT",
    "PAUSED",
    "SCHEDULED",
    "ARCHIVED",
];