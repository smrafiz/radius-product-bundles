import type { Bundle, BundleProduct } from "@/prisma/generated/client";

jest.mock("@/prisma/generated/client", () => ({
    BundleType: { FIXED_BUNDLE: "FIXED_BUNDLE", VOLUME_DISCOUNT: "VOLUME_DISCOUNT" },
    BundleStatus: { DRAFT: "DRAFT", ACTIVE: "ACTIVE" },
    DiscountType: { PERCENTAGE: "PERCENTAGE", QUANTITY_BREAKS: "QUANTITY_BREAKS" },
}));

jest.mock("@/features/bundles", () => ({
    BundleType: { FIXED_BUNDLE: "FIXED_BUNDLE", VOLUME_DISCOUNT: "VOLUME_DISCOUNT" },
    BundleStatus: { DRAFT: "DRAFT", ACTIVE: "ACTIVE" },
    DiscountType: { PERCENTAGE: "PERCENTAGE", QUANTITY_BREAKS: "QUANTITY_BREAKS" },
    TransformedBundle: {},
    TransformedBundleBase: {},
    TransformedBundleListing: {},
}));

jest.mock("@/shared", () => ({
    removeNulls: (obj: Record<string, unknown>) =>
        Object.fromEntries(
            Object.entries(obj).filter(([, v]) => v !== null && v !== undefined),
        ),
}));

import { transformBundle } from "../bundle-transformer.service";

function makeMinimalBundle(
    overrides: Partial<Bundle & { bundleProducts: BundleProduct[] }> = {},
): Bundle & { bundleProducts: BundleProduct[] } {
    return {
        id: "bundle-1",
        shop: "test.myshopify.com",
        name: "Test Bundle",
        description: null,
        type: "FIXED_BUNDLE" as any,
        status: "DRAFT" as any,
        mainProductId: null,
        mainVariantId: null,
        isPublished: false,
        publishedAt: null,
        buyQuantity: null,
        getQuantity: null,
        usesPerOrderLimit: null,
        minimumItems: null,
        maximumItems: null,
        discountType: "PERCENTAGE" as any,
        discountValue: 10,
        minOrderValue: null,
        maxDiscountAmount: null,
        mixAndMatchPrice: null,
        allowMixAndMatch: false,
        discountApplication: "bundle",
        discountedProductIds: [],
        freeShipping: false,
        priority: 0,
        volumeTiers: null as any,
        sameProductMode: false,
        views: 0,
        conversions: 0,
        revenue: 0,
        aiOptimized: false,
        aiScore: null,
        marketingCopy: null,
        seoTitle: null,
        seoDescription: null,
        images: [],
        startDate: null,
        endDate: null,
        deletedAt: null,
        createdAt: new Date("2024-01-01"),
        updatedAt: new Date("2024-01-01"),
        bundleProducts: [],
        ...overrides,
    } as unknown as Bundle & { bundleProducts: BundleProduct[] };
}

describe("transformBundle — volumeTiers passthrough", () => {
    it("valid JSON volumeTiers are passed through as-is", () => {
        const tiers = {
            discountType: "PERCENTAGE",
            openEnded: true,
            tiers: [{ minQuantity: 2, discount: 10, title: "Tier 1" }],
        };
        const bundle = makeMinimalBundle({ volumeTiers: tiers as any });
        const result = transformBundle(bundle);
        expect(result.volumeTiers).toEqual(tiers);
    });

    it("null volumeTiers becomes undefined", () => {
        const bundle = makeMinimalBundle({ volumeTiers: null as any });
        const result = transformBundle(bundle);
        expect(result.volumeTiers).toBeUndefined();
    });

    it("Prisma.JsonNull sentinel (null at runtime) becomes undefined", () => {
        // At runtime Prisma returns JS null for DB-null JSON fields.
        // The Prisma.JsonNull symbol is only used as a query input filter.
        const bundle = makeMinimalBundle({ volumeTiers: null as any });
        const result = transformBundle(bundle);
        expect(result.volumeTiers).toBeUndefined();
    });
});
