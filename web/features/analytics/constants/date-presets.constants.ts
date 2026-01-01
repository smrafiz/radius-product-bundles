import {
    getLast30Days,
    getLast365Days,
    getLast7Days,
    getLast90Days,
    getLastMonth,
    getLastWeek,
    getToday,
    getYesterday,
} from "@/features/analytics";

/**
 * Date range preset configuration
 */
export const DATE_RANGE_PRESETS = [
    { key: "today", label: "Today", getValue: getToday },
    { key: "yesterday", label: "Yesterday", getValue: getYesterday },
    { key: "last7", label: "Last 7 days", getValue: getLast7Days },
    { key: "last30", label: "Last 30 days", getValue: getLast30Days },
    { key: "last90", label: "Last 90 days", getValue: getLast90Days },
    { key: "last365", label: "Last 365 days", getValue: getLast365Days },
    { key: "lastWeek", label: "Last week", getValue: getLastWeek },
    { key: "lastMonth", label: "Last month", getValue: getLastMonth },
] as const;

export const DATE_PRESET_GROUPS = [
    { start: 0, end: 2 },
    { start: 2, end: 6 },
    { start: 6, end: 8 },
] as const;
