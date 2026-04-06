jest.mock("@/prisma/generated/client", () => ({
    ShopifySubscriptionStatus: {
        ACTIVE: "ACTIVE",
        CANCELLED: "CANCELLED",
        DECLINED: "DECLINED",
        EXPIRED: "EXPIRED",
        FROZEN: "FROZEN",
        PENDING: "PENDING",
    },
    PlanName: {
        FREE: "FREE",
        PRO: "PRO",
    },
    ShopStatus: {
        ACTIVE: "ACTIVE",
        SUSPENDED: "SUSPENDED",
        TRIAL_EXPIRED: "TRIAL_EXPIRED",
        NOT_CONFIGURED: "NOT_CONFIGURED",
    },
}));

import {
    handleSubscriptionWebhookService,
} from "../subscription.service";

jest.mock("@/features/pricing/repositories/shop-plan.repository", () => ({
    getShopPlanRecord: jest.fn().mockResolvedValue(null),
    upsertShopPlan: jest.fn().mockResolvedValue(undefined),
    cancelShopPlan: jest.fn().mockResolvedValue(undefined),
}));

jest.mock("@/shared/repositories/shop.queries", () => ({
    upsertShop: jest.fn().mockResolvedValue(undefined),
    getShop: jest.fn(),
}));

jest.mock("@/shared/repositories", () => ({
    findOfflineSessionByShop: jest.fn().mockResolvedValue(null),
}));

jest.mock("@/lib/graphql/client", () => ({
    executeGraphQLMutation: jest.fn(),
    executeGraphQLQuery: jest.fn(),
}));

import { upsertShop } from "@/shared/repositories/shop.queries";
import { upsertShopPlan, getShopPlanRecord } from "@/features/pricing/repositories/shop-plan.repository";
const mockUpsertShop = upsertShop as jest.MockedFunction<typeof upsertShop>;
const mockUpsertShopPlan = upsertShopPlan as jest.MockedFunction<typeof upsertShopPlan>;
const mockGetShopPlanRecord = getShopPlanRecord as jest.MockedFunction<typeof getShopPlanRecord>;

beforeEach(() => jest.clearAllMocks());

describe("handleSubscriptionWebhookService — status mapping", () => {
    it("sets ShopStatus.TRIAL_EXPIRED when subscription EXPIRES", async () => {
        await handleSubscriptionWebhookService(
            "test.myshopify.com",
            "gid://shopify/AppSubscription/1",
            "EXPIRED",
            "Radius Pro",
        );
        expect(mockUpsertShop).toHaveBeenCalledWith(
            "test.myshopify.com",
            expect.objectContaining({ status: "TRIAL_EXPIRED" }),
        );
    });

    it("sets ShopStatus.SUSPENDED when subscription is CANCELLED", async () => {
        await handleSubscriptionWebhookService(
            "test.myshopify.com",
            "gid://shopify/AppSubscription/1",
            "CANCELLED",
            "Radius Pro",
        );
        expect(mockUpsertShop).toHaveBeenCalledWith(
            "test.myshopify.com",
            expect.objectContaining({ status: "SUSPENDED" }),
        );
    });

    it("sets ShopStatus.SUSPENDED when subscription DECLINED", async () => {
        await handleSubscriptionWebhookService(
            "test.myshopify.com",
            "gid://shopify/AppSubscription/1",
            "DECLINED",
            "Radius Pro",
        );
        expect(mockUpsertShop).toHaveBeenCalledWith(
            "test.myshopify.com",
            expect.objectContaining({ status: "SUSPENDED" }),
        );
    });
});

describe("handleSubscriptionWebhookService — plan resolution", () => {
    it("resolves PRO plan from stored billingId even if plan name changed", async () => {
        mockGetShopPlanRecord.mockResolvedValue({
            id: "1",
            shop: "test.myshopify.com",
            shopId: null,
            billingId: "gid://shopify/AppSubscription/999",
            plan: "PRO" as any,
            status: "ACTIVE" as any,
            billingInterval: "EVERY_30_DAYS",
            trialUsed: false,
            trialEndsAt: null,
            currentPeriodEnd: null,
            activatedAt: null,
            cancelledAt: null,
            createdAt: new Date(),
            updatedAt: new Date(),
        });

        await handleSubscriptionWebhookService(
            "test.myshopify.com",
            "gid://shopify/AppSubscription/999",
            "ACTIVE",
            "Radius Growth Plan", // name no longer contains "pro"
        );

        expect(mockUpsertShopPlan).toHaveBeenCalledWith(
            "test.myshopify.com",
            expect.objectContaining({ plan: "PRO" }),
        );
    });

    it("falls back to FREE plan when billingId not found locally and name has no 'pro'", async () => {
        mockGetShopPlanRecord.mockResolvedValue(null);

        await handleSubscriptionWebhookService(
            "test.myshopify.com",
            "gid://shopify/AppSubscription/999",
            "ACTIVE",
            "Radius Growth Plan",
        );

        expect(mockUpsertShopPlan).toHaveBeenCalledWith(
            "test.myshopify.com",
            expect.objectContaining({ plan: "FREE" }),
        );
    });
});
