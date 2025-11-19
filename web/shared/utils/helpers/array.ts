/**
 * Shuffle array for randomized pattern selection
 */
export function shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

/**
 * Chunk array into smaller arrays
 */
export function chunk<T>(array: T[], size: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += size) {
        chunks.push(array.slice(i, i + size));
    }
    return chunks;
}

/**
 * Get unique values from array
 */
export function unique<T>(array: T[]): T[] {
    return [...new Set(array)];
}

/**
 * Group array items by key
 */
export function groupBy<T>(
    array: T[],
    key: keyof T | ((item: T) => string),
): Record<string, T[]> {
    return array.reduce(
        (groups, item) => {
            const groupKey =
                typeof key === "function" ? key(item) : String(item[key]);
            if (!groups[groupKey]) {
                groups[groupKey] = [];
            }
            groups[groupKey].push(item);
            return groups;
        },
        {} as Record<string, T[]>,
    );
}

/**
 * Sort array by key
 */
export function sortBy<T>(
    array: T[],
    key: keyof T | ((item: T) => any),
    direction: "asc" | "desc" = "asc",
): T[] {
    return [...array].sort((a, b) => {
        const aVal = typeof key === "function" ? key(a) : a[key];
        const bVal = typeof key === "function" ? key(b) : b[key];

        if (aVal < bVal) return direction === "asc" ? -1 : 1;
        if (aVal > bVal) return direction === "asc" ? 1 : -1;
        return 0;
    });
}
