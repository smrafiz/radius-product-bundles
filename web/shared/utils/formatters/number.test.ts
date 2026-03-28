import {
    formatPercentage,
    formatGrowth,
    formatCompactNumber,
    formatNumber,
} from "./number";

describe("formatPercentage", () => {
    it("should format percentage with default decimals", () => {
        expect(formatPercentage(50)).toBe("50.0%");
    });

    it("should format percentage with specified decimals", () => {
        expect(formatPercentage(33.333, 2)).toBe("33.33%");
    });

    it("should handle zero", () => {
        expect(formatPercentage(0)).toBe("0.0%");
    });

    it("should handle negative values", () => {
        expect(formatPercentage(-10)).toBe("-10.0%");
    });

    it("should handle null", () => {
        expect(formatPercentage(null)).toBe("0.0%");
    });

    it("should handle undefined", () => {
        expect(formatPercentage(undefined)).toBe("0.0%");
    });

    it("should handle NaN", () => {
        expect(formatPercentage(NaN)).toBe("0.0%");
    });

    it("should round correctly", () => {
        expect(formatPercentage(33.33333, 1)).toBe("33.3%");
    });
});

describe("formatGrowth", () => {
    it("should add + prefix for positive values", () => {
        expect(formatGrowth(10)).toBe("+10.0%");
    });

    it("should add no prefix for negative values", () => {
        expect(formatGrowth(-5)).toBe("-5.0%");
    });

    it("should handle zero", () => {
        expect(formatGrowth(0)).toBe("+0.0%");
    });

    it("should handle specified decimals", () => {
        expect(formatGrowth(10.555, 2)).toBe("+10.56%");
    });
});

describe("formatCompactNumber", () => {
    it("should format millions with M", () => {
        expect(formatCompactNumber(1500000)).toBe("1.5M");
    });

    it("should format thousands with K", () => {
        expect(formatCompactNumber(2500)).toBe("2.5K");
    });

    it("should return string for small numbers", () => {
        expect(formatCompactNumber(100)).toBe("100");
    });

    it("should handle exact thousands", () => {
        expect(formatCompactNumber(1000)).toBe("1.0K");
    });

    it("should handle exact millions", () => {
        expect(formatCompactNumber(1000000)).toBe("1.0M");
    });
});

describe("formatNumber", () => {
    it("should format with thousand separators", () => {
        expect(formatNumber(1000)).toBe("1,000");
    });

    it("should format large numbers", () => {
        expect(formatNumber(1000000)).toBe("1,000,000");
    });

    it("should handle zero", () => {
        expect(formatNumber(0)).toBe("0");
    });

    it("should handle negative numbers", () => {
        expect(formatNumber(-1000)).toBe("-1,000");
    });
});
