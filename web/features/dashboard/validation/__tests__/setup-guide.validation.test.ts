import { SetupProgressSchema } from "../setup-guide.validation";

describe("SetupProgressSchema", () => {
    it("accepts a fully-populated valid object", () => {
        const result = SetupProgressSchema.safeParse({
            appEmbedEnabled: true,
            firstBundleCreated: false,
            widgetBlockAdded: true,
            widgetCustomized: false,
            storefrontPreviewed: true,
            analyticsViewed: false,
        });
        expect(result.success).toBe(true);
    });

    it("accepts all-false (default state)", () => {
        const result = SetupProgressSchema.safeParse({
            appEmbedEnabled: false,
            firstBundleCreated: false,
            widgetBlockAdded: false,
            widgetCustomized: false,
            storefrontPreviewed: false,
            analyticsViewed: false,
        });
        expect(result.success).toBe(true);
    });

    it("rejects a non-boolean field", () => {
        const result = SetupProgressSchema.safeParse({
            appEmbedEnabled: "yes",
            firstBundleCreated: false,
            widgetBlockAdded: false,
            widgetCustomized: false,
            storefrontPreviewed: false,
            analyticsViewed: false,
        });
        expect(result.success).toBe(false);
    });

    it("rejects missing required field", () => {
        const result = SetupProgressSchema.safeParse({
            appEmbedEnabled: true,
            firstBundleCreated: true,
            // widgetBlockAdded missing
            widgetCustomized: false,
            storefrontPreviewed: false,
            analyticsViewed: false,
        });
        expect(result.success).toBe(false);
    });

    it("rejects extra unknown fields (strict mode)", () => {
        const result = SetupProgressSchema.safeParse({
            appEmbedEnabled: true,
            firstBundleCreated: true,
            widgetBlockAdded: true,
            widgetCustomized: false,
            storefrontPreviewed: false,
            analyticsViewed: false,
            unknownField: true,
        });
        expect(result.success).toBe(false);
    });
});
