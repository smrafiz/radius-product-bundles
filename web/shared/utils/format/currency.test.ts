import { formatCurrency, parseCurrency } from "./currency";

describe("formatCurrency", () => {
    it("should format USD correctly", () => {
        expect(formatCurrency(1234.56, "USD")).toBe("$1,234.56");
    });

    it("should parse currency string", () => {
        expect(parseCurrency("$1,234.56")).toBe(1234.56);
    });
});
