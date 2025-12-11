import { formatCurrency } from "@/shared";

describe("formatCurrency", () => {
    it("should format USD correctly", () => {
        expect(formatCurrency(1234.56, "USD")).toBe("$1,234.56");
    });
});
