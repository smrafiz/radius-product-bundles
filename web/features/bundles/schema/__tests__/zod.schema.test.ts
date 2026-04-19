jest.unmock("zod");
jest.unmock("@/shared/constants");

jest.mock("@/shared", () => ({
    sanitizeText: (val: string) => val,
}));

jest.mock("@/shared/constants", () => ({
    VALIDATION_MESSAGES: {
        REQUIRED_FIELD: "This field is required",
        MAX_LENGTH: "Bundle name cannot exceed 100 characters",
        MAX_DESC_LENGTH: "Description cannot exceed 500 characters",
        NO_PRODUCTS_SELECTED: "At least two products must be selected",
        PERCENTAGE_EXCEED: "Percentage cannot exceed 100%",
        PERCENTAGE_POSITIVE: "Percentage must be positive",
        FIXED_AMOUNT_POSITIVE: "Fixed amount must be positive",
        CUSTOM_PRICE_INVALID: "Custom price must be greater than 0",
        MAX_PRODUCTS_20: "Maximum 20 products",
        BXGY_QUANTITIES_REQUIRED: "Buy and get quantities required",
        BOGO_BUY_QTY: "BOGO buy quantity must be 1",
        BOGO_GET_QTY: "BOGO get quantity must be 1",
        TRIGGER_REQUIRED: "Trigger product required",
        REWARD_REQUIRED: "Reward product required",
        MIX_MATCH_PRICING: "Mix and match pricing required",
        END_DATE_AFTER_START: "End date must be after start date",
        SCHEDULED_DATES_REQUIRED: "Scheduled dates required",
        VOLUME_TIERS_REQUIRED: "Volume discount bundles require at least one tier",
        QTY_REQUIRED: "Quantity is required",
        DISCOUNT_REQUIRED: "Discount is required",
        WHOLE_NUMBER: "Quantity must be a whole number",
        MIN_QUANTITY: "Minimum quantity is 1",
        DISCOUNT_NEGATIVE: "Discount cannot be negative",
        DISCOUNT_MAX: "Discount exceeds maximum",
        MAX_DECIMAL_PLACES: "Maximum 2 decimal places",
        TIER_TITLE_REQUIRED: "Tier title is required",
        TIER_TITLE_MAX: "Tier title too long",
        TIER_SUBTITLE_MAX: "Tier subtitle too long",
        MIN_TIERS: "At least one tier required",
        MAX_TIERS: "Maximum 10 tiers",
        TIER_ORDER: "Tier {index} must be greater than {value}",
        TIER_PERCENTAGE_MAX: "Percentage discount cannot exceed 99.99%",
        TIER_ONE_DEFAULT: "Only one tier can be pre-selected",
        GROUP_NAME_REQUIRED: "Group name is required",
        NO_PRODUCTS_SELECTED_VOLUME: "At least one product must be selected",
        BXGY_QUANTITIES_REQUIRED_VOLUME: "Buy and get quantities required",
    },
}));

import { createBundleSchema, volumeDiscountConfigSchema } from "../zod.schema";

const VALIDATION_MESSAGES: Record<string, string> = {
    REQUIRED_FIELD: "This field is required",
    MAX_LENGTH: "Bundle name cannot exceed 100 characters",
    MAX_DESC_LENGTH: "Description cannot exceed 500 characters",
    NO_PRODUCTS_SELECTED: "At least two products must be selected",
    PERCENTAGE_EXCEED: "Percentage cannot exceed 100%",
    PERCENTAGE_POSITIVE: "Percentage must be positive",
    FIXED_AMOUNT_POSITIVE: "Fixed amount must be positive",
    CUSTOM_PRICE_INVALID: "Custom price must be greater than 0",
    MAX_PRODUCTS_20: "Maximum 20 products",
    BXGY_QUANTITIES_REQUIRED: "Buy and get quantities required",
    BOGO_BUY_QTY: "BOGO buy quantity must be 1",
    BOGO_GET_QTY: "BOGO get quantity must be 1",
    TRIGGER_REQUIRED: "Trigger product required",
    REWARD_REQUIRED: "Reward product required",
    MIX_MATCH_PRICING: "Mix and match pricing required",
    END_DATE_AFTER_START: "End date must be after start date",
    SCHEDULED_DATES_REQUIRED: "Scheduled dates required",
    VOLUME_TIERS_REQUIRED: "Volume discount bundles require at least one tier",
    QTY_REQUIRED: "Quantity is required",
    DISCOUNT_REQUIRED: "Discount is required",
    WHOLE_NUMBER: "Quantity must be a whole number",
    MIN_QUANTITY: "Minimum quantity is 1",
    DISCOUNT_NEGATIVE: "Discount cannot be negative",
    DISCOUNT_MAX: "Discount exceeds maximum",
    MAX_DECIMAL_PLACES: "Maximum 2 decimal places",
    TIER_TITLE_REQUIRED: "Tier title is required",
    TIER_TITLE_MAX: "Tier title too long",
    TIER_SUBTITLE_MAX: "Tier subtitle too long",
    MIN_TIERS: "At least one tier required",
    MAX_TIERS: "Maximum 10 tiers",
    TIER_ORDER: "Tier {index} must be greater than {value}",
    TIER_PERCENTAGE_MAX: "Percentage discount cannot exceed 99.99%",
    TIER_ONE_DEFAULT: "Only one tier can be pre-selected",
    GROUP_NAME_REQUIRED: "Group name is required",
    NO_PRODUCTS_SELECTED_VOLUME: "At least one product must be selected",
};

const v = (key: string) => VALIDATION_MESSAGES[key] ?? key;
const schema = createBundleSchema(v);

function makeProduct(overrides?: Record<string, unknown>) {
    return {
        productId: "gid://shopify/Product/1",
        variantId: "gid://shopify/ProductVariant/1",
        quantity: 1,
        role: "INCLUDED" as const,
        ...overrides,
    };
}

function makeBase(overrides?: Record<string, unknown>) {
    return {
        name: "Test Bundle",
        type: "FIXED_BUNDLE",
        discountType: "PERCENTAGE",
        discountValue: 10,
        products: [makeProduct(), makeProduct({ productId: "gid://shopify/Product/2" })],
        ...overrides,
    };
}

describe("Bundle Zod Schema", () => {
    describe("products.min conditionalization", () => {
        it("FIXED_BUNDLE with 2 products passes", () => {
            const result = schema.safeParse(makeBase());
            expect(result.success).toBe(true);
        });

        it("FIXED_BUNDLE with 1 product fails (needs 2)", () => {
            const result = schema.safeParse(
                makeBase({ products: [makeProduct()] }),
            );
            expect(result.success).toBe(false);
            if (!result.success) {
                const productErrors = result.error.issues.filter(
                    (i) => i.path.includes("products"),
                );
                expect(productErrors.length).toBeGreaterThan(0);
            }
        });

        it("FIXED_BUNDLE with 0 products fails", () => {
            const result = schema.safeParse(makeBase({ products: [] }));
            expect(result.success).toBe(false);
        });

        it("VOLUME_DISCOUNT with 1 product passes (needs only 1)", () => {
            const result = schema.safeParse(
                makeBase({
                    type: "VOLUME_DISCOUNT",
                    discountType: "QUANTITY_BREAKS",
                    discountValue: 0,
                    products: [makeProduct()],
                    volumeTiers: {
                        discountType: "PERCENTAGE",
                        openEnded: true,
                        tiers: [
                            { minQuantity: 2, discount: 10, title: "Buy 2, save 10%" },
                            { minQuantity: 5, discount: 20, title: "Buy 5, save 20%" },
                        ],
                    },
                }),
            );
            expect(result.success).toBe(true);
        });

        it("VOLUME_DISCOUNT with 0 products fails (min 1)", () => {
            const result = schema.safeParse(
                makeBase({
                    type: "VOLUME_DISCOUNT",
                    discountType: "QUANTITY_BREAKS",
                    discountValue: 0,
                    products: [],
                    volumeTiers: {
                        discountType: "PERCENTAGE",
                        openEnded: true,
                        tiers: [{ minQuantity: 2, discount: 10, title: "Tier 1" }],
                    },
                }),
            );
            expect(result.success).toBe(false);
        });
    });

    describe("volumeDiscountConfig validation", () => {
        const volumeBase = (tierOverrides?: Record<string, unknown>[]) =>
            makeBase({
                type: "VOLUME_DISCOUNT",
                discountType: "QUANTITY_BREAKS",
                discountValue: 0,
                products: [makeProduct()],
                volumeTiers: {
                    discountType: "PERCENTAGE",
                    openEnded: true,
                    tiers: tierOverrides ?? [
                        { minQuantity: 2, discount: 10, title: "Tier 1" },
                        { minQuantity: 5, discount: 20, title: "Tier 2" },
                    ],
                },
            });

        it("valid 2-tier config passes", () => {
            const result = schema.safeParse(volumeBase());
            expect(result.success).toBe(true);
        });

        it("requires at least one tier", () => {
            const data = makeBase({
                type: "VOLUME_DISCOUNT",
                discountType: "QUANTITY_BREAKS",
                discountValue: 0,
                products: [makeProduct()],
                volumeTiers: {
                    discountType: "PERCENTAGE",
                    openEnded: true,
                    tiers: [],
                },
            });
            const result = schema.safeParse(data);
            expect(result.success).toBe(false);
        });

        it("VOLUME_DISCOUNT without volumeTiers fails", () => {
            const data = makeBase({
                type: "VOLUME_DISCOUNT",
                discountType: "QUANTITY_BREAKS",
                discountValue: 0,
                products: [makeProduct()],
            });
            const result = schema.safeParse(data);
            expect(result.success).toBe(false);
            if (!result.success) {
                const volErrors = result.error.issues.filter(
                    (i) => i.path.includes("volumeTiers"),
                );
                expect(volErrors.length).toBeGreaterThan(0);
            }
        });

        it("tiers must have strictly increasing minQuantity", () => {
            const result = schema.safeParse(
                volumeBase([
                    { minQuantity: 5, discount: 10, title: "Tier 1" },
                    { minQuantity: 3, discount: 20, title: "Tier 2" },
                ]),
            );
            expect(result.success).toBe(false);
            if (!result.success) {
                const mqErrors = result.error.issues.filter(
                    (i) => JSON.stringify(i.path).includes("minQuantity"),
                );
                expect(mqErrors.length).toBeGreaterThan(0);
            }
        });

        it("equal minQuantity across tiers fails", () => {
            const result = schema.safeParse(
                volumeBase([
                    { minQuantity: 5, discount: 10, title: "Tier 1" },
                    { minQuantity: 5, discount: 20, title: "Tier 2" },
                ]),
            );
            expect(result.success).toBe(false);
        });

        it("percentage discount cannot exceed 99.99%", () => {
            const result = schema.safeParse(
                volumeBase([
                    { minQuantity: 2, discount: 100, title: "Tier 1" },
                ]),
            );
            expect(result.success).toBe(false);
            if (!result.success) {
                const discErrors = result.error.issues.filter(
                    (i) => JSON.stringify(i.path).includes("discount"),
                );
                expect(discErrors.length).toBeGreaterThan(0);
            }
        });

        it("percentage 99.99% passes", () => {
            const result = schema.safeParse(
                volumeBase([
                    { minQuantity: 2, discount: 99.99, title: "Tier 1" },
                ]),
            );
            expect(result.success).toBe(true);
        });

        it("FIXED_AMOUNT discount allows values > 99.99", () => {
            const data = makeBase({
                type: "VOLUME_DISCOUNT",
                discountType: "QUANTITY_BREAKS",
                discountValue: 0,
                products: [makeProduct()],
                volumeTiers: {
                    discountType: "FIXED_AMOUNT",
                    openEnded: true,
                    tiers: [
                        { minQuantity: 2, discount: 150, title: "Tier 1" },
                    ],
                },
            });
            const result = schema.safeParse(data);
            expect(result.success).toBe(true);
        });

        it("only one tier can be pre-selected (isDefault)", () => {
            const result = schema.safeParse(
                volumeBase([
                    { minQuantity: 2, discount: 10, title: "T1", isDefault: true },
                    { minQuantity: 5, discount: 20, title: "T2", isDefault: true },
                ]),
            );
            expect(result.success).toBe(false);
            if (!result.success) {
                const defaultErrors = result.error.issues.filter(
                    (i) => i.message.includes("pre-selected"),
                );
                expect(defaultErrors.length).toBeGreaterThan(0);
            }
        });

        it("single isDefault tier passes", () => {
            const result = schema.safeParse(
                volumeBase([
                    { minQuantity: 2, discount: 10, title: "T1", isDefault: true },
                    { minQuantity: 5, discount: 20, title: "T2" },
                ]),
            );
            expect(result.success).toBe(true);
        });

        it("max 10 tiers", () => {
            const tiers = Array.from({ length: 11 }, (_, i) => ({
                minQuantity: i + 1,
                discount: (i + 1) * 5,
                title: `Tier ${i + 1}`,
            }));
            const result = schema.safeParse(volumeBase(tiers));
            expect(result.success).toBe(false);
        });

        it("tier title is required", () => {
            const result = schema.safeParse(
                volumeBase([{ minQuantity: 2, discount: 10, title: "" }]),
            );
            expect(result.success).toBe(false);
        });

        it("tier minQuantity must be at least 1", () => {
            const result = schema.safeParse(
                volumeBase([{ minQuantity: 0, discount: 10, title: "Zero" }]),
            );
            expect(result.success).toBe(false);
        });

        it("negative discount fails", () => {
            const result = schema.safeParse(
                volumeBase([{ minQuantity: 2, discount: -5, title: "Bad" }]),
            );
            expect(result.success).toBe(false);
        });

        it("NaN minQuantity is rejected with 'Quantity is required'", () => {
            const result = volumeDiscountConfigSchema.safeParse({
                discountType: "PERCENTAGE",
                openEnded: true,
                tiers: [{ minQuantity: NaN, discount: 10, title: "Tier 1" }],
            });
            expect(result.success).toBe(false);
            if (!result.success) {
                const messages = result.error.issues.map((i) => i.message);
                expect(messages.some((m) => m.includes("Quantity is required"))).toBe(true);
            }
        });

        it("NaN discount is rejected with 'Discount is required'", () => {
            const result = volumeDiscountConfigSchema.safeParse({
                discountType: "PERCENTAGE",
                openEnded: true,
                tiers: [{ minQuantity: 2, discount: NaN, title: "Tier 1" }],
            });
            expect(result.success).toBe(false);
            if (!result.success) {
                const messages = result.error.issues.map((i) => i.message);
                expect(messages.some((m) => m.includes("Discount is required"))).toBe(true);
            }
        });

        it("QUANTITY_BREAKS discountValue=0 does not trigger percentage validation", () => {
            const result = schema.safeParse(
                makeBase({
                    type: "VOLUME_DISCOUNT",
                    discountType: "QUANTITY_BREAKS",
                    discountValue: 0,
                    products: [makeProduct()],
                    volumeTiers: {
                        discountType: "PERCENTAGE",
                        openEnded: true,
                        tiers: [
                            { minQuantity: 2, discount: 10, title: "Tier 1" },
                        ],
                    },
                }),
            );
            expect(result.success).toBe(true);
        });
    });

    describe("non-volume types are unaffected", () => {
        it("BOGO requires trigger and reward products", () => {
            const result = schema.safeParse(
                makeBase({
                    type: "BOGO",
                    buyQuantity: 1,
                    getQuantity: 1,
                    products: [
                        makeProduct({ role: "TRIGGER" }),
                        makeProduct({
                            productId: "gid://shopify/Product/2",
                            role: "REWARD",
                        }),
                    ],
                }),
            );
            expect(result.success).toBe(true);
        });

        it("BOGO without reward fails", () => {
            const result = schema.safeParse(
                makeBase({
                    type: "BOGO",
                    buyQuantity: 1,
                    getQuantity: 1,
                    products: [
                        makeProduct({ role: "TRIGGER" }),
                        makeProduct({
                            productId: "gid://shopify/Product/2",
                            role: "TRIGGER",
                        }),
                    ],
                }),
            );
            expect(result.success).toBe(false);
        });
    });
});
