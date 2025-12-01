/**
 * Currency Formatting Utilities
 * Generic utilities for currency formatting and locale handling
 */

import { CURRENCY_LOCALES, CURRENCY_SYMBOLS } from "@/shared";

/**
 * Get currency symbol for a given currency code
 */
export const getCurrencySymbol = (currencyCode?: string): string => {
    return CURRENCY_SYMBOLS[currencyCode || "USD"] || "$";
};

/**
 * Format amount as currency with proper locale
 */
export const formatCurrency = (
    amount?: number | string | null,
    currencyCode?: string,
    locale?: string,
): string => {
    if (amount == null) {
        return "";
    }

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
            currency: currencyCode,
        }).format(Number(amount));
    }
};

/**
 * Convert Shopify locale to standard locale format
 */
export const convertShopifyLocale = (
    shopifyLocaleOrCountry: string,
): string => {
    // Check if it's a 2-letter country code
    if (
        shopifyLocaleOrCountry.length === 2 &&
        CURRENCY_SYMBOLS[shopifyLocaleOrCountry]
    ) {
        return CURRENCY_SYMBOLS[shopifyLocaleOrCountry];
    }

    // Check locale mapping
    if (CURRENCY_LOCALES[shopifyLocaleOrCountry]) {
        return CURRENCY_LOCALES[shopifyLocaleOrCountry];
    }

    // Default fallback
    return "en-US";
};
