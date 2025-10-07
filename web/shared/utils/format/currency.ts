/**
 * Format a number as currency
 */
export function formatCurrency(
    amount: number,
    currency: string = "USD",
    locale: string = "en-US",
): string {
    return new Intl.NumberFormat(locale, {
        style: "currency",
        currency,
    }).format(amount);
}

/**
 * Parse currency string to number
 */
export function parseCurrency(value: string): number {
    const cleaned = value.replace(/[^0-9.-]+/g, "");
    return parseFloat(cleaned) || 0;
}
