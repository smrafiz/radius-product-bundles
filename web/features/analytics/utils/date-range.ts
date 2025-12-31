/**
 * Date range utility functions
 *
 * Provides preset date range calculations for analytics.
 */

/**
 * Format date to ISO string (YYYY-MM-DD)
 */
export function formatDate(date: Date): string {
    return date.toISOString().split("T")[0];
}

/**
 * Parse date string to Date object
 */
export function parseDate(dateStr: string): Date {
    return new Date(dateStr + "T00:00:00");
}

/**
 * Get today's date range
 */
export function getToday(): { start: string; end: string } {
    const today = new Date();
    const d = formatDate(today);
    return { start: d, end: d };
}

/**
 * Get yesterday's date range
 */
export function getYesterday(): { start: string; end: string } {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const d = formatDate(yesterday);
    return { start: d, end: d };
}

/**
 * Get last N days range
 */
export function getLastNDays(days: number): { start: string; end: string } {
    const today = new Date();
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
    const today = new Date();
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
    const today = new Date();
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
    return /^\d{4}-\d{2}-\d{2}$/.test(dateStr);
}
