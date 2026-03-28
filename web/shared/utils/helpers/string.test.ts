import {
    capitalize,
    firstLetterCapital,
    titleCase,
    slugify,
    truncate,
    isEmpty,
} from "./string";

describe("capitalize", () => {
    it("should capitalize first letter", () => {
        expect(capitalize("hello")).toBe("Hello");
    });

    it("should lowercase the rest", () => {
        expect(capitalize("HELLO")).toBe("Hello");
    });

    it("should handle single character", () => {
        expect(capitalize("a")).toBe("A");
    });

    it("should handle empty string", () => {
        expect(capitalize("")).toBe("");
    });
});

describe("firstLetterCapital", () => {
    it("should return first letter capitalized", () => {
        expect(firstLetterCapital("hello")).toBe("H");
    });

    it("should handle whitespace only", () => {
        expect(firstLetterCapital("   ")).toBe("");
    });

    it("should trim whitespace", () => {
        expect(firstLetterCapital("  hello")).toBe("H");
    });

    it("should handle empty string", () => {
        expect(firstLetterCapital("")).toBe("");
    });
});

describe("titleCase", () => {
    it("should title case a sentence", () => {
        expect(titleCase("hello world")).toBe("Hello World");
    });

    it("should handle multiple spaces", () => {
        expect(titleCase("hello  world")).toBe("Hello  World");
    });

    it("should lowercase non-first letters", () => {
        expect(titleCase("HELLO WORLD")).toBe("Hello World");
    });

    it("should handle empty string", () => {
        expect(titleCase("")).toBe("");
    });
});

describe("slugify", () => {
    it("should convert to lowercase slug", () => {
        expect(slugify("Hello World")).toBe("hello-world");
    });

    it("should remove special characters", () => {
        expect(slugify("Hello @World!")).toBe("hello-world");
    });

    it("should replace spaces with hyphens", () => {
        expect(slugify("hello world test")).toBe("hello-world-test");
    });

    it("should remove leading/trailing hyphens", () => {
        expect(slugify("  hello  ")).toBe("hello");
    });

    it("should handle underscores", () => {
        expect(slugify("hello_world")).toBe("hello-world");
    });
});

describe("truncate", () => {
    it("should truncate long strings", () => {
        expect(truncate("hello world", 8)).toBe("hello...");
    });

    it("should not truncate short strings", () => {
        expect(truncate("hello", 10)).toBe("hello");
    });

    it("should handle exact length", () => {
        expect(truncate("hello", 5)).toBe("hello");
    });

    it("should handle empty string", () => {
        expect(truncate("", 5)).toBe("");
    });
});

describe("isEmpty", () => {
    it("should return true for empty string", () => {
        expect(isEmpty("")).toBe(true);
    });

    it("should return true for whitespace only", () => {
        expect(isEmpty("   ")).toBe(true);
    });

    it("should return false for non-empty string", () => {
        expect(isEmpty("hello")).toBe(false);
    });

    it("should return true for null", () => {
        expect(isEmpty(null)).toBe(true);
    });

    it("should return true for undefined", () => {
        expect(isEmpty(undefined)).toBe(true);
    });
});
