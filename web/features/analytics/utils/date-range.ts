import { useShopSettingsStore } from "@/shared";

/**
 * Get shop timezone from the settings store
 */
function getShopTimezone(): string {
    const settings = useShopSettingsStore.getState().settings;

    // If shop settings loaded, use shop timezone
    if (settings?.timezone) {
        return settings.timezone;
    }

    // Fallback to browser's timezone
    return Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
}

/**
 * Format date to ISO string (YYYY-MM-DD) in shop timezone
 */
export function formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
}

/**
 * Parse date string to a Date object
 */
export function parseDate(dateStr: string): Date {
    const [year, month, day] = dateStr.split("-").map(Number);
    return new Date(year, month - 1, day);
}

/**
 * Get current date in shop timezone
 */
export function getTodayInShopTimezone(): Date {
    const timezone = getShopTimezone();
    const now = new Date();

    const formatter = new Intl.DateTimeFormat("en-US", {
        timeZone: timezone,
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
    });

    const parts = formatter.formatToParts(now);
    const year = parseInt(parts.find((p) => p.type === "year")?.value || "0");
    const month = parseInt(parts.find((p) => p.type === "month")?.value || "0");
    const day = parseInt(parts.find((p) => p.type === "day")?.value || "0");

    return new Date(year, month - 1, day);
}

/**
 * Get today's date range
 */
export function getToday(): { start: string; end: string } {
    const today = getTodayInShopTimezone();
    const d = formatDate(today);
    return { start: d, end: d };
}

/**
 * Get yesterday's date range
 */
export function getYesterday(): { start: string; end: string } {
    const today = getTodayInShopTimezone();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const d = formatDate(yesterday);
    return { start: d, end: d };
}

/**
 * Get last N days range
 */
export function getLastNDays(days: number): { start: string; end: string } {
    const today = getTodayInShopTimezone();
    const end = formatDate(today);
    const start = new Date(today);
    start.setDate(start.getDate() - (days - 1));

    return { start: formatDate(start), end };
}

/**
 * Get last 7 days range
 */
export function getLast7Days(): { start: string; end: string } {
    return getLastNDays(7);
}

/**
 * Get last 30 days range
 */
export function getLast30Days(): { start: string; end: string } {
    return getLastNDays(30);
}

/**
 * Get last 90 days range
 */
export function getLast90Days(): { start: string; end: string } {
    return getLastNDays(90);
}

/**
 * Get last 365 days range
 */
export function getLast365Days(): { start: string; end: string } {
    return getLastNDays(365);
}

/**
 * Get last week range (Monday to Sunday)
 */
export function getLastWeek(): { start: string; end: string } {
    const today = getTodayInShopTimezone();
    const end = new Date(today);
    end.setDate(end.getDate() - end.getDay()); // Last Sunday
    const start = new Date(end);
    start.setDate(start.getDate() - 6); // Previous Monday
    return { start: formatDate(start), end: formatDate(end) };
}

/**
 * Get last month range
 */
export function getLastMonth(): { start: string; end: string } {
    const today = getTodayInShopTimezone();
    const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
    const lastDay = new Date(today.getFullYear(), today.getMonth(), 0);
    return { start: formatDate(lastMonth), end: formatDate(lastDay) };
}

/**
 * Get date range label for number of days
 */
export function getLabelForDays(days: number): string {
    switch (days) {
        case 1:
            return "Today";
        case 7:
            return "Last 7 days";
        case 30:
            return "Last 30 days";
        case 90:
            return "Last 90 days";
        case 365:
            return "Last 365 days";
        default:
            return `Last ${days} days`;
    }
}

/**
 * Get preset key for number of days
 */
export function getPresetForDays(days: number): string {
    switch (days) {
        case 1:
            return "today";
        case 7:
            return "last7";
        case 30:
            return "last30";
        case 90:
            return "last90";
        case 365:
            return "last365";
        default:
            return "last30";
    }
}

/**
 * Format date range label like Shopify
 */
export function formatDateRangeLabel(
    startDateStr: string,
    endDateStr: string,
    preset?: string,
): string {
    // If custom, show only date range
    if (!preset || preset === "custom") {
        return formatDateRange(startDateStr, endDateStr);
    }

    // If preset, show only preset name using existing utility
    return getLabelForPreset(preset);
}

/**
 * Get label for preset key
 */
function getLabelForPreset(preset: string): string {
    switch (preset) {
        case "today":
            return "Today";
        case "yesterday":
            return "Yesterday";
        case "last7":
            return "Last 7 days";
        case "last30":
            return "Last 30 days";
        case "last90":
            return "Last 90 days";
        case "last365":
            return "Last 365 days";
        case "lastWeek":
            return "Last week";
        case "lastMonth":
            return "Last month";
        default:
            return "Last 30 days";
    }
}

/**
 * Format date range as string (e.g., "Dec 2–31, 2025")
 */
function formatDateRange(startDateStr: string, endDateStr: string): string {
    const start = parseDate(startDateStr);
    const end = parseDate(endDateStr);

    const startMonth = start.toLocaleDateString("en-US", { month: "short" });
    const endMonth = end.toLocaleDateString("en-US", { month: "short" });
    const startDay = start.getDate();
    const endDay = end.getDate();
    const year = end.getFullYear();

    // Single day
    if (start.getTime() === end.getTime()) {
        return `${startMonth} ${startDay}, ${year}`;
    }

    // Same month
    if (
        start.getMonth() === end.getMonth() &&
        start.getFullYear() === end.getFullYear()
    ) {
        return `${startMonth} ${startDay}–${endDay}, ${year}`;
    }

    // Same year, different months
    if (start.getFullYear() === end.getFullYear()) {
        return `${startMonth} ${startDay}–${endMonth} ${endDay}, ${year}`;
    }

    // Different years
    return `${startMonth} ${startDay}, ${start.getFullYear()}–${endMonth} ${endDay}, ${year}`;
}

/**
 * Get initial date range based on days
 */
export function getInitialRangeForDays(days: number): {
    start: string;
    end: string;
} {
    switch (days) {
        case 1:
            return getToday();
        case 7:
            return getLast7Days();
        case 30:
            return getLast30Days();
        case 90:
            return getLast90Days();
        case 365:
            return getLast365Days();
        default:
            return getLast30Days();
    }
}

/**
 * Validate date string format (YYYY-MM-DD)
 */
export function isValidDateString(dateStr: string): boolean {
    if (!dateStr || !/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
        return false;
    }

    const date = parseDate(dateStr);
    return !isNaN(date.getTime());
}

/**
 * Validate date range
 */
export function isValidDateRange(start: string, end: string): boolean {
    if (!isValidDateString(start) || !isValidDateString(end)) {
        return false;
    }

    const startDate = parseDate(start);
    const endDate = parseDate(end);

    return startDate <= endDate;
}

/**
 * Parse date string as UTC (no timezone shift)
 */
export function parseDateAsUTC(dateStr: string): Date {
    return new Date(dateStr + "T00:00:00.000Z");
}

/**
 * Get end of day in UTC
 */
export function endOfDayUTC(dateStr: string): Date {
    return new Date(dateStr + "T23:59:59.999Z");
}

/**
 * Builds a human-friendly date range label
 */
export function getDateRangeLabel(
    startDate?: string | Date,
    endDate?: string | Date,
    formatDate?: (date: Date) => string,
): string | null {
    if (!startDate || !endDate) {
        return null;
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    const sameDay = start.toDateString() === end.toDateString();
    const sameYear = start.getFullYear() === end.getFullYear();

    const format =
        formatDate ??
        ((date: Date) =>
            date.toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
            }));

    const startLabel = format(start);
    const endLabel = format(end);

    if (sameDay) {
        return `${startLabel}, ${start.getFullYear()}`;
    }

    if (sameYear) {
        return `${startLabel} – ${endLabel}, ${start.getFullYear()}`;
    }

    return `${startLabel}, ${start.getFullYear()} – ${endLabel}, ${end.getFullYear()}`;
}
