/**
 * Format number with thousands separator
 */
export function formatNumber(
    value: number,
    decimals: number = 0,
    locale: string = 'en-US'
): string {
    return new Intl.NumberFormat(locale, {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
    }).format(value);
}

/**
 * Format number as percentage
 */
export function formatPercentage(
    value: number,
    decimals: number = 0
): string {
    return `${formatNumber(value, decimals)}%`;
}

/**
 * Format number with compact notation (1K, 1M, etc.)
 */
export function formatCompactNumber(
    value: number,
    locale: string = 'en-US'
): string {
    return new Intl.NumberFormat(locale, {
        notation: 'compact',
        compactDisplay: 'short',
    }).format(value);
}

/**
 * Clamp number between min and max
 */
export function clamp(value: number, min: number, max: number): number {
    return Math.min(Math.max(value, min), max);
}

/**
 * Round to specified decimal places
 */
export function roundTo(value: number, decimals: number = 2): number {
    const multiplier = Math.pow(10, decimals);
    return Math.round(value * multiplier) / multiplier;
}