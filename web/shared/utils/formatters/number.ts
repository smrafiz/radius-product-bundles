/**
 * Format number as percentage
 */
export const formatPercentage = (
    value: number | undefined | null,
    decimals: number = 1,
): string => {
    if (value === undefined || value === null || isNaN(value)) {
        return "0.0%";
    }
    return `${value.toFixed(decimals)}%`;
};

/**
 * Format growth value with +/- prefix
 */
export const formatGrowth = (value: number, decimals: number = 1): string => {
    const prefix = value >= 0 ? "+" : "";
    return `${prefix}${value.toFixed(decimals)}%`;
};

/**
 * Format large numbers with abbreviations
 */
export const formatCompactNumber = (value: number): string => {
    if (value >= 1_000_000) {
        return `${(value / 1_000_000).toFixed(1)}M`;
    }
    if (value >= 1_000) {
        return `${(value / 1_000).toFixed(1)}K`;
    }
    return value.toString();
};

/**
 * Format number with thousand separator
 */
export const formatNumber = (
    value: number,
    locale: string = "en-US",
): string => {
    return value.toLocaleString(locale);
};

/**
 * Format metric value based on type (compact, card-friendly)
 */
export { formatByType } from "./format-by-type";
