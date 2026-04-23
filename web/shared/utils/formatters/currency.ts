/**
 * Currency Formatting Utilities
 * Generic utilities for currency formatting and locale handling
 */

import { CURRENCY_LOCALES, CURRENCY_SYMBOLS } from "@/shared/constants/currency.constants";

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

/*
 * Format amount as currency compact (locale-aware sign + symbol placement)
 */
export const formatCurrencyCompact = (
    amount?: number | string | null,
    {
        currencyCode,
        locale,
        decimals = 1,
    }: {
        currencyCode?: string;
        locale?: string;
        decimals?: number;
    } = {},
): string => {
    if (amount == null) return "";

    const value = Number(amount);
    if (Number.isNaN(value)) {
        return "";
    }

    const finalCurrencyCode = currencyCode || "USD";
    const finalLocale = locale || convertShopifyLocale("en-US");

    // Small numbers → normal currency (preserves 2-decimal precision)
    if (Math.abs(value) < 1000) {
        return formatCurrency(value, finalCurrencyCode, finalLocale);
    }

    try {
        return new Intl.NumberFormat(finalLocale, {
            style: "currency",
            currency: finalCurrencyCode,
            currencyDisplay: "symbol",
            notation: "compact",
            compactDisplay: "short",
            maximumFractionDigits: decimals,
        }).format(value);
    } catch (error) {
        console.warn("Compact currency formatting error:", error, {
            finalCurrencyCode,
            finalLocale,
        });

        // Fallback: manual format with sign before symbol
        const units = [
            { limit: 1e9, suffix: "B" },
            { limit: 1e6, suffix: "M" },
            { limit: 1e3, suffix: "K" },
        ];
        const unit = units.find((u) => Math.abs(value) >= u.limit)!;
        const compactValue = Math.abs(value) / unit.limit;
        const sign = value < 0 ? "-" : "";
        const fixed = compactValue.toFixed(decimals);
        const trimmed = fixed.endsWith(".0") ? fixed.slice(0, -2) : fixed;
        const symbol = getCurrencySymbol(finalCurrencyCode);
        return `${sign}${symbol}${trimmed}${unit.suffix}`;
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
