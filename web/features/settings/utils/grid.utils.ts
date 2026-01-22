/**
 * Gets Tailwind grid class based on column count.
 */
export function getGridClass(columns: number): string {
    switch (columns) {
        case 2:
            return "grid grid-cols-1 md:grid-cols-2 gap-4";
        case 3:
            return "grid grid-cols-1 md:grid-cols-3 gap-4";
        default:
            return "grid grid-cols-1 gap-4";
    }
}
