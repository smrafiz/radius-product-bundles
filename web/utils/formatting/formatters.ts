import { CURRENCY_LOCALES, CURRENCY_SYMBOLS } from "@/shared";

/**
 * Get currency symbol for a given currency code
 */
export const getCurrencySymbol = (currencyCode?: string): string => {
    return CURRENCY_SYMBOLS[currencyCode || "USD"] || "$";
};

/**
 * Format currency with currency code and locale
 */
export const formatCurrency = (
    amount?: number | string | null,
    currencyCode?: string,
    locale?: string,
): string => {
    if (amount == null) return "";

    const finalCurrencyCode = currencyCode || "USD";
    const finalLocale = locale || convertShopifyLocale("en-US");

    try {
        const formatted = Intl.NumberFormat(finalLocale, {
            style: "currency",
            currency: finalCurrencyCode,
            currencyDisplay: "symbol",
        }).format(Number(amount));

        const symbol = getCurrencySymbol(finalCurrencyCode);

        if (symbol && !formatted.includes(symbol)) {
            return `${symbol}${Number(amount).toLocaleString(finalLocale)}`;
        }

        return formatted;
    } catch (error) {
        console.warn("Currency formatting error:", error, {
            finalCurrencyCode,
            finalLocale,
        });

        // Fallback
        return new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "USD",
        }).format(Number(amount));
    }
};

/**
 * Format percentage with 1 decimal place
 */
export const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`;
};

/**
 * Format growth with 1 decimal place
 */
export const formatGrowth = (value: number) => {
    const prefix = value >= 0 ? "+" : "";
    return `${prefix}${value.toFixed(1)}%`;
};

/**
 * Convert Shopify locale
 */
export const convertShopifyLocale = (
    shopifyLocaleOrCountry: string,
): string => {
    if (
        shopifyLocaleOrCountry.length === 2 &&
        CURRENCY_SYMBOLS[shopifyLocaleOrCountry]
    ) {
        return CURRENCY_SYMBOLS[shopifyLocaleOrCountry];
    }

    if (CURRENCY_LOCALES[shopifyLocaleOrCountry]) {
        return CURRENCY_LOCALES[shopifyLocaleOrCountry];
    }

    return "en-US";
};
