import { useShopSettingsStore } from "@/stores";

export const formatCurrency = (
    amount?: number | string | null,
    currencyCode?: string,
    locale?: string,
): string => {
    if (amount == null) return "";

    const currencySymbols: Record<string, string> = {
        BDT: "৳",
        USD: "$",
        EUR: "€",
        GBP: "£",
        JPY: "¥",
        CAD: "$",
        AUD: "$",
        INR: "₹",
        NZD: "$",
        CHF: "CHF",
        SEK: "kr",
        NOK: "kr",
        DKK: "kr",
        ZAR: "R",
        SGD: "$",
        HKD: "$",
        CNY: "¥",
        KRW: "₩",
        TRY: "₺",
        RUB: "₽",
        BRL: "R$",
        MXN: "$",
        PLN: "zł",
        THB: "฿",
        TWD: "NT$",
        AED: "د.إ",
        SAR: "﷼",
    };

    const finalCurrencyCode =
        currencyCode || useShopSettingsStore.getState().getCurrencyCode();
    const finalLocale =
        locale || convertShopifyLocale(useShopSettingsStore.getState().getLocale());

    try {
        const formatted = Intl.NumberFormat(finalLocale, {
            style: "currency",
            currency: finalCurrencyCode,
            currencyDisplay: "symbol",
        }).format(Number(amount));

        const symbol = currencySymbols[finalCurrencyCode];

        if (symbol && !formatted.includes(symbol)) {
            return `${symbol}${Number(amount).toLocaleString(finalLocale)}`;
        }

        return formatted;
    } catch (error) {
        console.warn(
            "Currency formatting error:",
            error,
            { finalCurrencyCode, finalLocale }
        );

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

export const convertShopifyLocale = (shopifyLocaleOrCountry: string): string => {
    const languageMap: Record<string, string> = {
        'en': 'en-US',
        'fr': 'fr-FR',
        'de': 'de-DE',
        'es': 'es-ES',
        'it': 'it-IT',
        'ja': 'ja-JP',
        'zh': 'zh-CN',
        'pt': 'pt-BR',
        'nl': 'nl-NL',
        'sv': 'sv-SE',
        'da': 'da-DK',
        'no': 'no-NO',
        'fi': 'fi-FI',
        'pl': 'pl-PL',
        'cs': 'cs-CZ',
        'hu': 'hu-HU',
        'ro': 'ro-RO',
        'ru': 'ru-RU',
        'tr': 'tr-TR',
        'ar': 'ar-SA',
        'he': 'he-IL',
        'th': 'th-TH',
        'ko': 'ko-KR',
        'hi': 'hi-IN',
    };

    const countryMap: Record<string, string> = {
        US: 'en-US',
        CA: 'en-CA',
        FR: 'fr-FR',
        DE: 'de-DE',
        GB: 'en-GB',
        AU: 'en-AU',
        JP: 'ja-JP',
        CN: 'zh-CN',
        BR: 'pt-BR',
        NL: 'nl-NL',
        SE: 'sv-SE',
        DK: 'da-DK',
        NO: 'no-NO',
        FI: 'fi-FI',
        PL: 'pl-PL',
        CZ: 'cs-CZ',
        HU: 'hu-HU',
        RO: 'ro-RO',
        RU: 'ru-RU',
        TR: 'tr-TR',
        SA: 'ar-SA',
        IL: 'he-IL',
        TH: 'th-TH',
        KR: 'ko-KR',
        IN: 'hi-IN',
    };

    if (shopifyLocaleOrCountry.length === 2 && languageMap[shopifyLocaleOrCountry]) {
        return languageMap[shopifyLocaleOrCountry];
    }

    if (countryMap[shopifyLocaleOrCountry]) {
        return countryMap[shopifyLocaleOrCountry];
    }

    return 'en-US';
};