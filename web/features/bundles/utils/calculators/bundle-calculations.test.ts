import {
    calculateBundlePrice,
    calculateDiscountAmount,
    calculateSavingsPercentage,
    calculateDiscountedPrice,
    calculateBundleStats,
} from "./bundle-calculations";
import { SelectedItem } from "@/features/bundles/types";

describe("calculateBundlePrice", () => {
    const createItem = (price: string, quantity: number): SelectedItem => ({
        id: "1",
        productId: "prod_1",
        variantIds: [],
        title: "Test",
        url: "/products/test",
        type: "product" as const,
        quantity,
        price,
        handle: "test",
        vendor: "Test Vendor",
        productType: "Test Type",
        totalVariants: 1,
    });

    it("should calculate total price correctly", () => {
        const items = [createItem("10.00", 2), createItem("20.00", 1)];
        expect(calculateBundlePrice(items)).toBe(40);
    });

    it("should handle empty array", () => {
        expect(calculateBundlePrice([])).toBe(0);
    });

    it("should handle invalid price as zero", () => {
        const items = [createItem("invalid", 1)];
        expect(calculateBundlePrice(items)).toBe(0);
    });

    it("should multiply by quantity", () => {
        const items = [createItem("10.00", 3)];
        expect(calculateBundlePrice(items)).toBe(30);
    });
});

describe("calculateDiscountAmount", () => {
    it("should calculate percentage discount", () => {
        const result = calculateDiscountAmount(100, "PERCENTAGE", 10);
        expect(result).toBe(10);
    });

    it("should calculate fixed discount", () => {
        const result = calculateDiscountAmount(100, "FIXED_AMOUNT", 25);
        expect(result).toBe(25);
    });

    it("should return 0 for unknown discount type", () => {
        const result = calculateDiscountAmount(100, "UNKNOWN", 10);
        expect(result).toBe(0);
    });

    it("should cap discount at maxDiscountAmount", () => {
        const result = calculateDiscountAmount(100, "PERCENTAGE", 50, 30);
        expect(result).toBe(30);
    });

    it("should not exceed bundle price", () => {
        const result = calculateDiscountAmount(50, "FIXED_AMOUNT", 100);
        expect(result).toBe(50);
    });

    it("should handle zero discount value", () => {
        const result = calculateDiscountAmount(100, "PERCENTAGE", 0);
        expect(result).toBe(0);
    });
});

describe("calculateSavingsPercentage", () => {
    it("should calculate savings percentage", () => {
        const result = calculateSavingsPercentage(100, 75);
        expect(result).toBe(25);
    });

    it("should return 0 for original price of 0", () => {
        expect(calculateSavingsPercentage(0, 50)).toBe(0);
    });

    it("should return 100 when free", () => {
        expect(calculateSavingsPercentage(100, 0)).toBe(100);
    });

    it("should round to nearest integer", () => {
        expect(calculateSavingsPercentage(100, 66.6)).toBe(33);
    });
});

describe("calculateDiscountedPrice", () => {
    it("should apply percentage discount", () => {
        const result = calculateDiscountedPrice(100, "PERCENTAGE", 20);
        expect(result).toBe(80);
    });

    it("should apply fixed discount", () => {
        const result = calculateDiscountedPrice(100, "FIXED_AMOUNT", 30);
        expect(result).toBe(70);
    });

    it("should return original price for CUSTOM_PRICE", () => {
        const result = calculateDiscountedPrice(100, "CUSTOM_PRICE", 50);
        expect(result).toBe(100);
    });

    it("should return original price for NO_DISCOUNT", () => {
        const result = calculateDiscountedPrice(100, "NO_DISCOUNT", 50);
        expect(result).toBe(100);
    });

    it("should return original price for invalid discount type", () => {
        const result = calculateDiscountedPrice(100, "UNKNOWN", 50);
        expect(result).toBe(100);
    });

    it("should return original price for zero discount value", () => {
        const result = calculateDiscountedPrice(100, "PERCENTAGE", 0);
        expect(result).toBe(100);
    });

    it("should cap at maxDiscountAmount", () => {
        const result = calculateDiscountedPrice(100, "PERCENTAGE", 80, 50);
        expect(result).toBe(50);
    });

    it("should not return negative price", () => {
        const result = calculateDiscountedPrice(100, "FIXED_AMOUNT", 150);
        expect(result).toBe(0);
    });
});

describe("calculateBundleStats", () => {
    it("should calculate conversion rate", () => {
        const bundle = {
            views: 100,
            conversions: 25,
            revenue: 0,
        } as any;
        const result = calculateBundleStats(bundle);
        expect(result.conversionRate).toBe(25);
    });

    it("should calculate average revenue", () => {
        const bundle = {
            views: 0,
            conversions: 10,
            revenue: 500,
        } as any;
        const result = calculateBundleStats(bundle);
        expect(result.avgRevenue).toBe(50);
    });

    it("should handle zero views", () => {
        const bundle = {
            views: 0,
            conversions: 0,
            revenue: 0,
        } as any;
        const result = calculateBundleStats(bundle);
        expect(result.conversionRate).toBe(0);
    });

    it("should handle zero conversions", () => {
        const bundle = {
            views: 100,
            conversions: 0,
            revenue: 0,
        } as any;
        const result = calculateBundleStats(bundle);
        expect(result.avgRevenue).toBe(0);
    });
});
