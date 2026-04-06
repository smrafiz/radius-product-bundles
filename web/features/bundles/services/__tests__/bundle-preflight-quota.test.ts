import { fetchBundlePreflight } from "../bundle-operation.service";

jest.mock("@/prisma/generated/client", () => ({
    ShopStatus: { ACTIVE: "ACTIVE", SUSPENDED: "SUSPENDED", TRIAL_EXPIRED: "TRIAL_EXPIRED", NOT_CONFIGURED: "NOT_CONFIGURED" },
    BundleStatus: { DRAFT: "DRAFT", ACTIVE: "ACTIVE" },
}));

jest.mock("@/shared/repositories/shop.queries", () => ({
    getShopWithLimits: jest.fn().mockResolvedValue({
        status: "ACTIVE",
        appSettings: { maxBundlesPerShop: 3, cacheTtl: 300 },
    }),
}));

jest.mock("@/features/bundles/repositories", () => ({
    countBundlesByShop: jest.fn().mockResolvedValue(5),
    countRecentBundles: jest.fn().mockResolvedValue(0),
    getBundleActivity: jest.fn().mockResolvedValue({ created: 0, updated: 0, deleted: 0 }),
}));

jest.mock("@/shared/services/plan.service", () => ({
    checkBundleQuota: jest.fn().mockResolvedValue({ allowed: true, current: 5, limit: -1 }),
}));

jest.mock("@/shared/repositories", () => ({
    getShop: jest.fn(),
}));

jest.mock("@/features/bundles/services", () => ({
    performSecurityChecks: jest.fn().mockResolvedValue({ passed: true }),
}));

jest.mock("@/features/bundles", () => ({
    validateBusinessRules: jest.fn().mockReturnValue({ success: true }),
    validateSecurity: jest.fn().mockReturnValue({ success: true }),
    BundleStatus: { DRAFT: "DRAFT", ACTIVE: "ACTIVE" },
}));

import { checkBundleQuota } from "@/shared/services/plan.service";
const mockCheckBundleQuota = checkBundleQuota as jest.MockedFunction<typeof checkBundleQuota>;

it("uses plan quota (checkBundleQuota) not appSettings.maxBundlesPerShop", async () => {
    const result = await fetchBundlePreflight("pro-shop.myshopify.com");
    expect(mockCheckBundleQuota).toHaveBeenCalledWith("pro-shop.myshopify.com");
    // PRO plan returns allowed:true even though appSettings.maxBundlesPerShop=3 and count=5
    expect(result.quota.allowed).toBe(true);
});
