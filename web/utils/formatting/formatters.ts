import { CURRENCY_LOCALES, CURRENCY_SYMBOLS } from "@/lib/constants";

/**
 * Get currency symbol for a given currency code
 * @param currencyCode - The currency code (e.g., 'USD', 'EUR')
 * @returns The currency symbol (e.g., '$', '€')
 */
export const getCurrencySymbol = (currencyCode?: string): string => {
    return CURRENCY_SYMBOLS[currencyCode || "USD"] || "$";
};

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

export const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`;
};

export const formatGrowth = (value: number) => {
    const prefix = value >= 0 ? "+" : "";
    return `${prefix}${value.toFixed(1)}%`;
};

export const formatBundleType = (type: string) => {
    return type
        .replace(/_/g, " ")
        .toLowerCase()
        .replace(/\b\w/g, (l) => l.toUpperCase());
};

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
