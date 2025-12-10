import { format, formatDistance, formatRelative } from "date-fns";

/**
 * Format date to standard string
 */
export function formatDate(
    date: Date | string,
    formatString: string = "MMM dd, yyyy",
): string {
    const dateObj = typeof date === "string" ? new Date(date) : date;
    return format(dateObj, formatString);
}

/**
 * Format date as relative time (e.g., "2 hours ago")
 */
export function formatRelativeDate(date: Date | string): string {
    const dateObj = typeof date === "string" ? new Date(date) : date;
    return formatDistance(dateObj, new Date(), { addSuffix: true });
}

/**
 * Format date as relative description
 */
export function formatRelativeDescription(date: Date | string): string {
    const dateObj = typeof date === "string" ? new Date(date) : date;
    return formatRelative(dateObj, new Date());
}

/**
 * Get date N days ago
 */
export function getDaysAgo(days: number): Date {
    const date = new Date();
    date.setDate(date.getDate() - days);
    return date;
}

/**
 * Get date 30 days ago
 */
export function getThirtyDaysAgo(): Date {
    return getDaysAgo(30);
}

/**
 * Get date 60 days ago
 */
export function getSixtyDaysAgo(): Date {
    return getDaysAgo(60);
}

/**
 * Get date N minutes ago
 */
export function getMinutesAgo(minutes: number): Date {
    return new Date(Date.now() - minutes * 60 * 1000);
}

/**
 * Get date N hours ago
 */
export function getHoursAgo(hours: number): Date {
    return new Date(Date.now() - hours * 60 * 60 * 1000);
}

/**
 * Get date range for last N days
 */
export function getLastNDaysRange(days: number): { start: Date; end: Date } {
    return {
        start: getDaysAgo(days),
        end: new Date(),
    };
}

export function formatDateLong(dateStr: string) {
    if (!dateStr) return "";

    const date = new Date(dateStr);

    const day = String(date.getDate()).padStart(2, "0");
    const monthShort = date.toLocaleString("en-US", { month: "short" });
    const year = date.getFullYear();

    return `${monthShort} ${day}, ${year}`;
}
