import {
    checkAbusivePatterns,
    checkRateLimit,
    checkShopStatus,
    canCreateBundle,
    detectAbusiveBehavior,
    performSecurityChecks,
    validateShopPermissions,
} from "./bundle-security.service";

// Mock repositories used by the service
jest.mock("@/features/bundles/repositories", () => ({
    countBundlesByShop: jest.fn(),
    countRecentBundles: jest.fn(),
    getBundleActivity: jest.fn(),
}));

jest.mock("@/shared/repositories", () => ({
    getShop: jest.fn(),
    getShopStatus: jest.fn(),
}));

jest.mock("@/shared/services/plan.service", () => ({
    checkBundleQuota: jest.fn(),
    checkBundleTypeAllowed: jest.fn(),
    checkBundleStatusAllowed: jest.fn(),
}));

import {
    countRecentBundles,
    getBundleActivity,
} from "@/features/bundles/repositories";
import { getShopStatus } from "@/shared/repositories";
import {
    checkBundleQuota,
    checkBundleTypeAllowed,
    checkBundleStatusAllowed,
} from "@/shared/services/plan.service";

const mockCountRecentBundles = countRecentBundles as jest.MockedFunction<typeof countRecentBundles>;
const mockGetShopStatus = getShopStatus as jest.MockedFunction<typeof getShopStatus>;
const mockGetBundleActivity = getBundleActivity as jest.MockedFunction<typeof getBundleActivity>;
const mockCheckBundleQuota = checkBundleQuota as jest.MockedFunction<typeof checkBundleQuota>;
const mockCheckBundleTypeAllowed = checkBundleTypeAllowed as jest.MockedFunction<typeof checkBundleTypeAllowed>;
const mockCheckBundleStatusAllowed = checkBundleStatusAllowed as jest.MockedFunction<typeof checkBundleStatusAllowed>;

const SHOP = "test-shop.myshopify.com";

beforeEach(() => {
    jest.clearAllMocks();
});

// ─── checkRateLimit ──────────────────────────────────────────────────────────

describe("checkRateLimit", () => {
    it("passes when bundle count is below the limit", async () => {
        mockCountRecentBundles.mockResolvedValue(4);
        const result = await checkRateLimit(SHOP, 10);
        expect(result.passed).toBe(true);
    });

    it("passes when bundle count equals limit minus one", async () => {
        mockCountRecentBundles.mockResolvedValue(9);
        const result = await checkRateLimit(SHOP, 10);
        expect(result.passed).toBe(true);
    });

    it("fails when bundle count equals the limit", async () => {
        mockCountRecentBundles.mockResolvedValue(10);
        const result = await checkRateLimit(SHOP, 10);
        expect(result.passed).toBe(false);
        expect(result.reason).toContain("Rate limit exceeded");
        expect(result.reason).toContain("10");
    });

    it("fails when bundle count exceeds the limit", async () => {
        mockCountRecentBundles.mockResolvedValue(25);
        const result = await checkRateLimit(SHOP, 10);
        expect(result.passed).toBe(false);
    });

    it("uses default limit of 10 when none provided", async () => {
        mockCountRecentBundles.mockResolvedValue(10);
        const result = await checkRateLimit(SHOP);
        expect(result.passed).toBe(false);
    });

    it("passes with zero bundles", async () => {
        mockCountRecentBundles.mockResolvedValue(0);
        const result = await checkRateLimit(SHOP, 10);
        expect(result.passed).toBe(true);
    });
});

// ─── checkShopStatus ─────────────────────────────────────────────────────────

describe("checkShopStatus", () => {
    it("passes for an ACTIVE shop", async () => {
        mockGetShopStatus.mockResolvedValue("ACTIVE");
        const result = await checkShopStatus(SHOP);
        expect(result.passed).toBe(true);
    });

    it("fails for a SUSPENDED shop", async () => {
        mockGetShopStatus.mockResolvedValue("SUSPENDED");
        const result = await checkShopStatus(SHOP);
        expect(result.passed).toBe(false);
        expect(result.reason).toContain("suspended");
    });

    it("fails for TRIAL_EXPIRED", async () => {
        mockGetShopStatus.mockResolvedValue("TRIAL_EXPIRED");
        const result = await checkShopStatus(SHOP);
        expect(result.passed).toBe(false);
        expect(result.reason).toContain("Trial");
    });

    it("fails for NOT_CONFIGURED", async () => {
        mockGetShopStatus.mockResolvedValue("NOT_CONFIGURED");
        const result = await checkShopStatus(SHOP);
        expect(result.passed).toBe(false);
        expect(result.reason).toContain("configured");
    });

    it("passes for unrecognised status values", async () => {
        mockGetShopStatus.mockResolvedValue("UNKNOWN_STATUS" as any);
        const result = await checkShopStatus(SHOP);
        expect(result.passed).toBe(true);
    });
});

// ─── detectAbusiveBehavior ───────────────────────────────────────────────────

describe("detectAbusiveBehavior", () => {
    it("returns not abusive for normal activity", async () => {
        mockGetBundleActivity.mockResolvedValue({ created: 5, deleted: 0, since: new Date() });
        const result = await detectAbusiveBehavior(SHOP);
        expect(result.isAbusive).toBe(false);
    });

    it("returns not abusive at threshold boundary (exactly 50)", async () => {
        mockGetBundleActivity.mockResolvedValue({ created: 50, deleted: 0, since: new Date() });
        const result = await detectAbusiveBehavior(SHOP);
        expect(result.isAbusive).toBe(false);
    });

    it("flags excessive creation above 50", async () => {
        mockGetBundleActivity.mockResolvedValue({ created: 51, deleted: 0, since: new Date() });
        const result = await detectAbusiveBehavior(SHOP);
        expect(result.isAbusive).toBe(true);
        expect(result.reason).toContain("51");
        expect(result.details?.created).toBe(51);
    });

    it("flags large creation count", async () => {
        mockGetBundleActivity.mockResolvedValue({ created: 200, deleted: 10, since: new Date() });
        const result = await detectAbusiveBehavior(SHOP);
        expect(result.isAbusive).toBe(true);
    });

    it("passes zero activity", async () => {
        mockGetBundleActivity.mockResolvedValue({ created: 0, deleted: 0, since: new Date() });
        const result = await detectAbusiveBehavior(SHOP);
        expect(result.isAbusive).toBe(false);
    });
});

// ─── checkAbusivePatterns ────────────────────────────────────────────────────

describe("checkAbusivePatterns", () => {
    it("passes for clean activity", async () => {
        mockGetBundleActivity.mockResolvedValue({ created: 3, deleted: 0, since: new Date() });
        const result = await checkAbusivePatterns(SHOP);
        expect(result.passed).toBe(true);
    });

    it("fails when abuse is detected", async () => {
        mockGetBundleActivity.mockResolvedValue({ created: 100, deleted: 5, since: new Date() });
        const result = await checkAbusivePatterns(SHOP);
        expect(result.passed).toBe(false);
        expect(result.reason).toBeTruthy();
    });
});

// ─── performSecurityChecks ───────────────────────────────────────────────────

describe("performSecurityChecks", () => {
    it("passes all checks for a healthy shop", async () => {
        mockCountRecentBundles.mockResolvedValue(0);
        mockGetShopStatus.mockResolvedValue("ACTIVE");
        mockGetBundleActivity.mockResolvedValue({ created: 1, deleted: 0, since: new Date() });

        const result = await performSecurityChecks(SHOP);
        expect(result.passed).toBe(true);
    });

    it("short-circuits on rate limit failure — does not call shop status", async () => {
        mockCountRecentBundles.mockResolvedValue(99);
        mockGetShopStatus.mockResolvedValue("ACTIVE");
        mockGetBundleActivity.mockResolvedValue({ created: 1, deleted: 0, since: new Date() });

        const result = await performSecurityChecks(SHOP);
        expect(result.passed).toBe(false);
        expect(result.reason).toContain("Rate limit");
        expect(mockGetShopStatus).not.toHaveBeenCalled();
    });

    it("short-circuits on shop status failure — does not check abuse", async () => {
        mockCountRecentBundles.mockResolvedValue(0);
        mockGetShopStatus.mockResolvedValue("SUSPENDED");
        mockGetBundleActivity.mockResolvedValue({ created: 1, deleted: 0, since: new Date() });

        const result = await performSecurityChecks(SHOP);
        expect(result.passed).toBe(false);
        expect(result.reason).toContain("suspended");
        expect(mockGetBundleActivity).not.toHaveBeenCalled();
    });

    it("fails on abuse detection after passing earlier checks", async () => {
        mockCountRecentBundles.mockResolvedValue(0);
        mockGetShopStatus.mockResolvedValue("ACTIVE");
        mockGetBundleActivity.mockResolvedValue({ created: 99, deleted: 0, since: new Date() });

        const result = await performSecurityChecks(SHOP);
        expect(result.passed).toBe(false);
        expect(result.reason).toContain("Excessive");
    });
});

// ─── canCreateBundle ─────────────────────────────────────────────────────────

describe("canCreateBundle", () => {
    it("allows creation when quota is not reached", async () => {
        mockCheckBundleQuota.mockResolvedValue({
            allowed: true,
            current: 2,
            limit: 5,
        });

        const result = await canCreateBundle(SHOP);
        expect(result.allowed).toBe(true);
        expect(result.current).toBe(2);
        expect(result.limit).toBe(5);
    });

    it("blocks creation when quota is reached", async () => {
        mockCheckBundleQuota.mockResolvedValue({
            allowed: false,
            current: 5,
            limit: 5,
        });

        const result = await canCreateBundle(SHOP);
        expect(result.allowed).toBe(false);
        expect(result.reason).toContain("5");
        expect(result.current).toBe(5);
        expect(result.limit).toBe(5);
    });
});

// ─── validateShopPermissions ─────────────────────────────────────────────────

describe("validateShopPermissions", () => {
    it("passes update without type or status checks", async () => {
        const result = await validateShopPermissions(SHOP, "update");
        expect(result.passed).toBe(true);
        expect(mockCheckBundleTypeAllowed).not.toHaveBeenCalled();
        expect(mockCheckBundleStatusAllowed).not.toHaveBeenCalled();
    });

    it("passes delete without any plan checks", async () => {
        const result = await validateShopPermissions(SHOP, "delete");
        expect(result.passed).toBe(true);
    });

    it("checks bundle type on create", async () => {
        mockCheckBundleTypeAllowed.mockResolvedValue({ allowed: true, gated: false, feature: "bundle_types", gateMode: "enabled", message: "" });

        const result = await validateShopPermissions(SHOP, "create", "FIXED_BUNDLE");
        expect(result.passed).toBe(true);
        expect(mockCheckBundleTypeAllowed).toHaveBeenCalledWith(SHOP, "FIXED_BUNDLE");
    });

    it("blocks create when bundle type is not allowed", async () => {
        mockCheckBundleTypeAllowed.mockResolvedValue({
            allowed: false,
            gated: true,
            feature: "bundle_types",
            gateMode: "lock-overlay",
            message: "Bundle type not available on FREE plan",
        });

        const result = await validateShopPermissions(SHOP, "create", "MIX_AND_MATCH");
        expect(result.passed).toBe(false);
        expect(result.reason).toBe("Bundle type not available on FREE plan");
    });

    it("checks bundle status on create", async () => {
        mockCheckBundleTypeAllowed.mockResolvedValue({ allowed: true, gated: false, feature: "bundle_types", gateMode: "enabled", message: "" });
        mockCheckBundleStatusAllowed.mockResolvedValue({ allowed: true, gated: false, feature: "bundle_status", gateMode: "enabled", message: "" });

        const result = await validateShopPermissions(SHOP, "create", "FIXED_BUNDLE", "ACTIVE");
        expect(result.passed).toBe(true);
        expect(mockCheckBundleStatusAllowed).toHaveBeenCalledWith(SHOP, "ACTIVE");
    });

    it("blocks create when status is not allowed (e.g. PAUSED on free plan)", async () => {
        mockCheckBundleTypeAllowed.mockResolvedValue({ allowed: true, gated: false, feature: "bundle_types", gateMode: "enabled", message: "" });
        mockCheckBundleStatusAllowed.mockResolvedValue({
            allowed: false,
            gated: true,
            feature: "bundle_status",
            gateMode: "lock-overlay",
            message: "PAUSED status requires a Pro plan",
        });

        const result = await validateShopPermissions(SHOP, "create", "FIXED_BUNDLE", "PAUSED");
        expect(result.passed).toBe(false);
        expect(result.reason).toBe("PAUSED status requires a Pro plan");
    });

    it("checks status on update without checking type", async () => {
        mockCheckBundleStatusAllowed.mockResolvedValue({ allowed: true, gated: false, feature: "bundle_status", gateMode: "enabled", message: "" });

        const result = await validateShopPermissions(SHOP, "update", undefined, "SCHEDULED");
        expect(result.passed).toBe(true);
        expect(mockCheckBundleTypeAllowed).not.toHaveBeenCalled();
        expect(mockCheckBundleStatusAllowed).toHaveBeenCalledWith(SHOP, "SCHEDULED");
    });
});
