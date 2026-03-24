/*
 * Bundle filters constants
 */

import { BUNDLE_TYPES } from "./bundle-types.constants";
import { BUNDLE_STATUSES } from "./bundle-statuses.constants";

/**
 * Statuses visible in bundle listing (excludes DELETED)
 */
const LISTING_STATUSES = Object.entries(BUNDLE_STATUSES).filter(
    ([key]) => key !== "DELETED",
);

/**
 * Bundle status filter options for IndexFilters
 */
export const BUNDLE_STATUS_FILTER_OPTIONS = LISTING_STATUSES.map(
    ([value, config]) => ({
        label: config.text,
        value,
    }),
);

/**
 * Bundle type filter options for IndexFilters
 */
export const BUNDLE_TYPE_FILTER_OPTIONS = Object.values(BUNDLE_TYPES).map(
    (config) => ({
        label: config.label,
        value: config.id,
    }),
);

/**
 * Sort options for bundle listing
 */
export const getBundleSortOptions = (t: (key: string) => string) =>
    [
        {
            label: t("sortByName"),
            field: "name",
            direction: "asc",
            directionLabel: t("sortAtoZ"),
        },
        {
            label: t("sortByName"),
            field: "name",
            direction: "desc",
            directionLabel: t("sortZtoA"),
        },
        {
            label: t("sortByCreated"),
            field: "createdAt",
            direction: "asc",
            directionLabel: t("sortOldestFirst"),
        },
        {
            label: t("sortByCreated"),
            field: "createdAt",
            direction: "desc",
            directionLabel: t("sortNewestFirst"),
        },
    ] as const;

export const BUNDLE_SORT_OPTIONS = getBundleSortOptions((key) => {
    const fallbacks: Record<string, string> = {
        sortByName: "Name",
        sortAtoZ: "A-Z",
        sortZtoA: "Z-A",
        sortByCreated: "Created",
        sortOldestFirst: "Oldest first",
        sortNewestFirst: "Newest first",
    };
    return fallbacks[key] || key;
});

/**
 * Default sort option
 */
export const DEFAULT_BUNDLE_SORT = ["createdAt desc"] as const;

/**
 * Tab strings for bundle filters (All + Status labels)
 */
export const BUNDLE_TAB_STRINGS = [
    "All",
    ...LISTING_STATUSES.map(([, config]) => config.text),
] as const;

/**
 * Map tab index to status filter value
 */
export const TAB_STATUS_MAP = [
    "ALL",
    ...LISTING_STATUSES.map(([key]) => key),
] as const;

/**
 * Search configuration
 */
export const BUNDLE_SEARCH_CONFIG = {
    placeholder: "Search bundles...",
    debounceMs: 500,
} as const;

/**
 * Complete bundle filters configuration
 */
export const BUNDLE_FILTERS = {
    status: {
        options: BUNDLE_STATUS_FILTER_OPTIONS,
        key: "bundleStatus",
    },
    type: {
        options: BUNDLE_TYPE_FILTER_OPTIONS,
        key: "bundleType",
    },
    sort: {
        options: BUNDLE_SORT_OPTIONS,
        default: DEFAULT_BUNDLE_SORT,
    },
    tabs: {
        items: BUNDLE_TAB_STRINGS,
        statusMap: TAB_STATUS_MAP,
    },
    search: BUNDLE_SEARCH_CONFIG,
} as const;
