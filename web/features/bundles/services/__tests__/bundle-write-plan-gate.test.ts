import { createBundleService } from "../bundle-write.service";

jest.mock("@/prisma/generated/client", () => ({
    ShopifySubscriptionStatus: { ACTIVE: "ACTIVE" },
    PlanName: { FREE: "FREE", PRO: "PRO" },
    ShopStatus: { ACTIVE: "ACTIVE", SUSPENDED: "SUSPENDED", TRIAL_EXPIRED: "TRIAL_EXPIRED", NOT_CONFIGURED: "NOT_CONFIGURED" },
    BundleStatus: { DRAFT: "DRAFT", ACTIVE: "ACTIVE", PAUSED: "PAUSED", ARCHIVED: "ARCHIVED", SCHEDULED: "SCHEDULED", DELETED: "DELETED" },
    BundleType: { FIXED_BUNDLE: "FIXED_BUNDLE" },
}));

jest.mock("@/features/bundles/services/bundle-operation.service", () => ({
    fetchBundlePreflight: jest.fn().mockResolvedValue({
        security: { success: true },
        context: { shopSettings: { appSettings: null } },
        quota: { allowed: true, current: 0 },
    }),
    handleBundleOperationError: jest.fn((e: Error) => ({
        success: false,
        message: e.message,
        errors: null,
        bundle: null,
    })),
    transformBundle: jest.fn((b: unknown) => b),
    validateBundleData: jest.fn().mockReturnValue({ success: true }),
}));

jest.mock("@/features/bundles/services", () => ({
    fetchBundlePreflight: jest.fn().mockResolvedValue({
        security: { success: true },
        context: { shopSettings: { appSettings: null } },
        quota: { allowed: true, current: 0 },
    }),
    handleBundleOperationError: jest.fn((e: Error) => ({
        success: false,
        message: e.message,
        errors: null,
        bundle: null,
    })),
    transformBundle: jest.fn((b: unknown) => b),
    validateBundleData: jest.fn().mockReturnValue({ success: true }),
}));

jest.mock("@/features/bundles/services/bundle-security.service", () => ({
    validateShopPermissions: jest.fn().mockResolvedValue({
        passed: false,
        reason: "Bundle type not available on FREE plan",
    }),
}));

jest.mock("@/features/bundles/repositories", () => ({
    createBundleWithRelations: jest.fn(),
    findBundleByIdWithAllRelations: jest.fn(),
    updateBundleWithRelations: jest.fn(),
    generateUniqueBundleName: jest.fn(),
    updateBundleStatusById: jest.fn(),
    bulkUpdateBundleStatuses: jest.fn(),
    deleteBundleWithRelations: jest.fn(),
    deleteBundlesWithRelations: jest.fn(),
}));

jest.mock("@/features/bundles", () => ({
    validateBundleData: jest.fn().mockReturnValue({ success: true, errors: {} }),
    validateBusinessRules: jest.fn().mockReturnValue({ isValid: true, errors: {} }),
    validateSecurity: jest.fn().mockReturnValue({ passed: true }),
    formatValidationErrorsAsString: jest.fn(),
    BUNDLE_STATUSES: { DRAFT: true, ACTIVE: true, PAUSED: true, ARCHIVED: true },
    BundleStatus: { DRAFT: "DRAFT", ACTIVE: "ACTIVE" },
}));

jest.mock("@/shared", () => ({
    formatValidationErrorsAsString: jest.fn(),
}));

import { validateShopPermissions } from "@/features/bundles/services/bundle-security.service";
const mockValidateShopPermissions = validateShopPermissions as jest.MockedFunction<
    typeof validateShopPermissions
>;

it("blocks FREE shop from creating MIX_AND_MATCH bundle", async () => {
    const result = await createBundleService({
        shop: "free-shop.myshopify.com",
        data: {
            name: "Test",
            type: "MIX_AND_MATCH",
            status: "ACTIVE",
            products: [],
        } as any,
    });

    expect(result.success).toBe(false);
    expect(result.message).toMatch(/FREE plan/i);
    expect(mockValidateShopPermissions).toHaveBeenCalledWith(
        "free-shop.myshopify.com",
        "create",
        "MIX_AND_MATCH",
        "ACTIVE",
    );
});
