/**
 * Capitalize the first letter of string
 */
export function capitalize(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

/**
 * Extract & capitalize the first letter of string
 */
export function firstLetterCapital(str: string): string {
    if (!str) {
        return "";
    }

    return str.trim().charAt(0).toUpperCase();
}

/**
 * Convert a string to a title case
 */
export function titleCase(str: string): string {
    return str
        .split(" ")
        .map((word) => capitalize(word))
        .join(" ");
}

/**
 * Convert string to slug
 */
export function slugify(str: string): string {
    return str
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, "")
        .replace(/[\s_-]+/g, "-")
        .replace(/^-+|-+$/g, "");
}

/**
 * Truncate string to max length
 */
export function truncate(str: string, maxLength: number): string {
    if (str.length <= maxLength) return str;
    return str.slice(0, maxLength - 3) + "...";
}

/**
 * Check if the string is empty or whitespace
 */
export function isEmpty(str: string | null | undefined): boolean {
    return !str || str.trim().length === 0;
}
