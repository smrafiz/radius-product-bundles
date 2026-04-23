import { CachedLocaleSchema, CachedLocalesArraySchema } from "../locale.validation";

describe("CachedLocaleSchema", () => {
    it("accepts a valid locale object", () => {
        expect(
            CachedLocaleSchema.safeParse({ locale: "en", name: "English", primary: true }).success,
        ).toBe(true);
    });

    it("accepts primary: false", () => {
        expect(
            CachedLocaleSchema.safeParse({ locale: "fr", name: "French", primary: false }).success,
        ).toBe(true);
    });

    it("rejects missing locale field", () => {
        expect(
            CachedLocaleSchema.safeParse({ name: "English", primary: true }).success,
        ).toBe(false);
    });

    it("rejects non-boolean primary", () => {
        expect(
            CachedLocaleSchema.safeParse({ locale: "en", name: "English", primary: "yes" }).success,
        ).toBe(false);
    });

    it("rejects extra fields (strict mode)", () => {
        expect(
            CachedLocaleSchema.safeParse({ locale: "en", name: "English", primary: true, extra: 1 }).success,
        ).toBe(false);
    });
});

describe("CachedLocalesArraySchema", () => {
    it("accepts empty array", () => {
        expect(CachedLocalesArraySchema.safeParse([]).success).toBe(true);
    });

    it("accepts array of valid locales", () => {
        expect(
            CachedLocalesArraySchema.safeParse([
                { locale: "en", name: "English", primary: true },
                { locale: "fr", name: "French", primary: false },
            ]).success,
        ).toBe(true);
    });

    it("rejects array containing invalid locale", () => {
        expect(
            CachedLocalesArraySchema.safeParse([
                { locale: "en", name: "English", primary: true },
                { locale: "fr", primary: false }, // missing name
            ]).success,
        ).toBe(false);
    });
});
