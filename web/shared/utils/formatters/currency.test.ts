import {
    formatCurrency,
    formatCurrencyCompact,
    getCurrencySymbol,
    convertShopifyLocale,
} from "./currency";

describe("formatCurrency", () => {
    it("should format USD correctly", () => {
        expect(formatCurrency(1234.56, "USD")).toBe("$1,234.56");
    });

    it("should handle null input", () => {
        expect(formatCurrency(null, "USD")).toBe("");
    });

    it("should handle undefined input", () => {
        expect(formatCurrency(undefined, "USD")).toBe("");
    });

    it("should handle string numbers", () => {
        expect(formatCurrency("1000", "USD")).toBe("$1,000.00");
    });

    it("should handle zero", () => {
        expect(formatCurrency(0, "USD")).toBe("$0.00");
    });

    it("should handle negative numbers", () => {
        expect(formatCurrency(-100, "USD")).toBe("-$100.00");
    });

    it("should format EUR correctly", () => {
        const result = formatCurrency(100, "EUR");
        expect(result).toContain("100");
    });

    it("should use default currency when not specified", () => {
        expect(formatCurrency(100)).toBe("$100.00");
    });
});

describe("formatCurrencyCompact", () => {
    it("should format small numbers normally", () => {
        const result = formatCurrencyCompact(100, { currencyCode: "USD" });
        expect(result).toBe("$100.00");
    });

    it("should format thousands with K suffix", () => {
        const result = formatCurrencyCompact(1500, { currencyCode: "USD" });
        expect(result).toContain("K");
    });

    it("should format millions with M suffix", () => {
        const result = formatCurrencyCompact(2500000, { currencyCode: "USD" });
        expect(result).toContain("M");
    });

    it("should format billions with B suffix", () => {
        const result = formatCurrencyCompact(3000000000, {
            currencyCode: "USD",
        });
        expect(result).toContain("B");
    });

    it("should handle null input", () => {
        expect(formatCurrencyCompact(null)).toBe("");
    });

    it("should handle undefined input", () => {
        expect(formatCurrencyCompact(undefined)).toBe("");
    });

    it("should handle NaN input", () => {
        expect(formatCurrencyCompact(NaN)).toBe("");
    });

    it("should handle negative numbers", () => {
        const result = formatCurrencyCompact(-1500, { currencyCode: "USD" });
        expect(result).toContain("K");
    });
});

describe("getCurrencySymbol", () => {
    it("should return $ for USD", () => {
        expect(getCurrencySymbol("USD")).toBe("$");
    });

    it("should return € for EUR", () => {
        expect(getCurrencySymbol("EUR")).toBe("€");
    });

    it("should return £ for GBP", () => {
        expect(getCurrencySymbol("GBP")).toBe("£");
    });

    it("should return ¥ for JPY", () => {
        expect(getCurrencySymbol("JPY")).toBe("¥");
    });

    it("should return $ for unknown currency", () => {
        expect(getCurrencySymbol("XYZ")).toBe("$");
    });

    it("should handle undefined input", () => {
        expect(getCurrencySymbol(undefined)).toBe("$");
    });
});

describe("convertShopifyLocale", () => {
    it("should convert 2-letter country codes", () => {
        expect(convertShopifyLocale("US")).toBe("US");
    });

    it("should handle en-US locale", () => {
        expect(convertShopifyLocale("en-US")).toBe("en-US");
    });

    it("should handle en-GB locale", () => {
        const result = convertShopifyLocale("en-GB");
        expect(result).toBe("en-GB");
    });

    it("should return en-US for unknown locale", () => {
        expect(convertShopifyLocale("xx-XX")).toBe("en-US");
    });
});
