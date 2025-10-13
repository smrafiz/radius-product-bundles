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
