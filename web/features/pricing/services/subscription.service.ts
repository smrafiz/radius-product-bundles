import {
    CreateAppSubscriptionDocument,
    CreateAppSubscriptionMutation,
    CreateAppSubscriptionMutationVariables,
    AppSubscriptionReplacementBehavior,
    AppPricingInterval,
    CurrencyCode,
    CancelAppSubscriptionDocument,
    CancelAppSubscriptionMutation,
    CancelAppSubscriptionMutationVariables,
    GetActiveSubscriptionDocument,
    GetActiveSubscriptionQuery,
} from "@/lib/graphql/generated/graphql";
import { executeGraphQLMutation, executeGraphQLQuery } from "@/lib/graphql/client";
import {
    getShopPlanRecord,
    upsertShopPlan,
    cancelShopPlan,
} from "@/features/pricing/repositories/shop-plan.repository";
import { upsertShop } from "@/shared/repositories/shop.queries";
import { findOfflineSessionByShop } from "@/shared/repositories";
import { ShopifySubscriptionStatus, PlanName, ShopStatus } from "@/prisma/generated/client";
import {
    PRO_MONTHLY_PRICE,
    PRO_ANNUAL_PRICE,
    PRO_TRIAL_DAYS,
    BILLING_CURRENCY,
} from "@/features/pricing/constants/pricing.constants";
import { BillingInterval, BillingStatusResponse } from "@/features/pricing/types/pricing.types";

const PRO_PLAN_NAME = "Radius Bundles Pro";

export class BillingError extends Error {
    constructor(
        message: string,
        public readonly code: "NOT_FOUND" | "ALREADY_ACTIVE" | "SHOPIFY_ERROR" | "NO_SUBSCRIPTION",
    ) {
        super(message);
        this.name = "BillingError";
    }
}

export async function createSubscriptionService(
    shop: string,
    accessToken: string,
    interval: BillingInterval,
    returnUrl: string,
): Promise<{
    confirmationUrl: string;
    subscriptionId: string;
}> {
    const existingPlan = await getShopPlanRecord(shop);
    if (existingPlan?.status === ShopifySubscriptionStatus.ACTIVE) {
        throw new BillingError(
            "Already has active subscription",
            "ALREADY_ACTIVE",
        );
    }

    const price = interval === "ANNUAL" ? PRO_ANNUAL_PRICE : PRO_MONTHLY_PRICE;
    const isTest = process.env.NODE_ENV !== "production";

    const variables: CreateAppSubscriptionMutationVariables = {
        name: PRO_PLAN_NAME,
        returnUrl: `${returnUrl}?shop=${shop}`,
        test: isTest,
        trialDays: PRO_TRIAL_DAYS,
        replacementBehavior:
            AppSubscriptionReplacementBehavior.ApplyImmediately,
        lineItems: [
            {
                plan: {
                    appRecurringPricingDetails: {
                        price: {
                            amount: price,
                            currencyCode: BILLING_CURRENCY as CurrencyCode,
                        },
                        interval: interval as AppPricingInterval,
                    },
                },
            },
        ],
    };

    const result = await executeGraphQLMutation<CreateAppSubscriptionMutation>({
        query: CreateAppSubscriptionDocument,
        variables,
        shop,
        accessToken,
    });

    if (result.errors) {
        console.error("[Billing] GraphQL errors:", result.errors);
        throw new BillingError(
            "Failed to create subscription",
            "SHOPIFY_ERROR",
        );
    }

    const payload = result.data?.appSubscriptionCreate;
    if (!payload) {
        throw new BillingError("No response from Shopify", "SHOPIFY_ERROR");
    }

    if (payload.userErrors.length > 0) {
        const msg = payload.userErrors[0]?.message ?? "Shopify billing error";
        throw new BillingError(msg, "SHOPIFY_ERROR");
    }

    const subscription = payload.appSubscription;
    if (!subscription) {
        throw new BillingError("Subscription not returned", "SHOPIFY_ERROR");
    }

    await upsertShopPlan(shop, {
        billingId: subscription.id,
        plan: PlanName.PRO,
        status: ShopifySubscriptionStatus.PENDING,
        billingInterval: interval,
        trialEndsAt: subscription.trialDays
            ? new Date(
                  Date.now() + subscription.trialDays * 24 * 60 * 60 * 1000,
              )
            : null,
    });

    return {
        confirmationUrl: payload.confirmationUrl ?? "",
        subscriptionId: subscription.id,
    };
}

export async function cancelSubscriptionService(
    shop: string,
    accessToken: string,
): Promise<void> {
    const planRecord = await getShopPlanRecord(shop);
    if (!planRecord?.billingId) {
        throw new BillingError("No active subscription found", "NO_SUBSCRIPTION");
    }

    const variables: CancelAppSubscriptionMutationVariables = {
        id: planRecord.billingId,
    };

    const result = await executeGraphQLMutation<CancelAppSubscriptionMutation>({
        query: CancelAppSubscriptionDocument,
        variables,
        shop,
        accessToken,
    });

    if (result.errors) {
        console.error("[Billing] GraphQL errors:", result.errors);
        throw new BillingError("Failed to cancel subscription", "SHOPIFY_ERROR");
    }

    const payload = result.data?.appSubscriptionCancel;
    if (!payload) {
        throw new BillingError("No response from Shopify", "SHOPIFY_ERROR");
    }

    if (payload.userErrors.length > 0) {
        const msg = payload.userErrors[0]?.message ?? "Shopify billing error";
        throw new BillingError(msg, "SHOPIFY_ERROR");
    }

    await cancelShopPlan(shop);
}

export async function confirmSubscriptionService(
    shop: string,
    accessToken: string,
    chargeId: string,
): Promise<void> {
    const result = await executeGraphQLQuery<GetActiveSubscriptionQuery>({
        query: GetActiveSubscriptionDocument,
        variables: {},
        shop,
        accessToken,
    });

    if (result.errors) {
        console.error("[Billing] GraphQL errors:", result.errors);
        throw new BillingError("Failed to fetch subscription from Shopify", "SHOPIFY_ERROR");
    }

    const subscriptions = result.data?.currentAppInstallation?.activeSubscriptions ?? [];
    // Shopify redirect sends numeric charge_id; GraphQL IDs are GID format.
    // Normalize to GID before comparing.
    const normalizedChargeId = chargeId.startsWith("gid://")
        ? chargeId
        : `gid://shopify/AppSubscription/${chargeId}`;
    const matchedSub = subscriptions.find((s) => s.id === normalizedChargeId);

    if (!matchedSub) {
        throw new BillingError("Subscription not found or not active", "NOT_FOUND");
    }

    const subStatus = matchedSub.status.toUpperCase() as ShopifySubscriptionStatus;
    if (subStatus !== ShopifySubscriptionStatus.ACTIVE) {
        throw new BillingError("Subscription is not active", "SHOPIFY_ERROR");
    }

    const lineItem = matchedSub.lineItems?.[0];
    const pricingDetails = lineItem?.plan?.pricingDetails;
    const pricing =
        pricingDetails &&
        "__typename" in pricingDetails &&
        pricingDetails.__typename === "AppRecurringPricing"
            ? pricingDetails
            : null;

    await upsertShopPlan(shop, {
        billingId: matchedSub.id,
        plan: PlanName.PRO,
        status: ShopifySubscriptionStatus.ACTIVE,
        activatedAt: new Date(),
        currentPeriodEnd: matchedSub.currentPeriodEnd
            ? new Date(matchedSub.currentPeriodEnd as string)
            : null,
        billingInterval: pricing?.interval ?? undefined,
    });

    await upsertShop(shop, { status: ShopStatus.ACTIVE });
}

export async function getSubscriptionStatusService(
    shop: string,
    accessToken: string,
): Promise<BillingStatusResponse> {
    const localPlan = await getShopPlanRecord(shop);

    const result = await executeGraphQLQuery<GetActiveSubscriptionQuery>({
        query: GetActiveSubscriptionDocument,
        variables: {},
        shop,
        accessToken,
    });

    if (result.errors) {
        console.error("[Billing] GraphQL errors:", result.errors);
        throw new BillingError("Failed to fetch subscription", "SHOPIFY_ERROR");
    }

    const subscriptions = result.data?.currentAppInstallation?.activeSubscriptions ?? [];

    if (subscriptions.length === 0) {
        return {
            subscription: null,
            localStatus: localPlan?.status ?? null,
            trialEndsAt: localPlan?.trialEndsAt?.toISOString() ?? null,
            status: "NO_SUBSCRIPTION",
        };
    }

    const sub = subscriptions[0];
    const lineItem = sub.lineItems?.[0];
    const pricingDetails = lineItem?.plan?.pricingDetails;
    const pricing =
        pricingDetails &&
        "__typename" in pricingDetails &&
        pricingDetails.__typename === "AppRecurringPricing"
            ? pricingDetails
            : null;

    return {
        subscription: {
            id: sub.id,
            name: sub.name,
            status: sub.status,
            createdAt: sub.createdAt,
            currentPeriodEnd: sub.currentPeriodEnd ?? null,
            trialDays: sub.trialDays,
            test: sub.test,
            price: pricing?.price?.amount ?? null,
            currencyCode: pricing?.price?.currencyCode ?? null,
            interval: pricing?.interval ?? null,
        },
        localStatus: localPlan?.status ?? null,
        trialEndsAt: localPlan?.trialEndsAt?.toISOString() ?? null,
        status: sub.status,
    };
}

export async function handleSubscriptionWebhookService(
    shop: string,
    subscriptionId: string,
    rawStatus: string,
    planName: string,
): Promise<void> {
    const normalizedStatus = rawStatus.toUpperCase() as ShopifySubscriptionStatus;
    const isActive = normalizedStatus === ShopifySubscriptionStatus.ACTIVE;
    const isCancelled = normalizedStatus === ShopifySubscriptionStatus.CANCELLED;
    const isFrozen = normalizedStatus === ShopifySubscriptionStatus.FROZEN;
    const isTerminated =
        normalizedStatus === ShopifySubscriptionStatus.CANCELLED ||
        normalizedStatus === ShopifySubscriptionStatus.EXPIRED ||
        normalizedStatus === ShopifySubscriptionStatus.DECLINED;

    // Resolve plan: prefer the stored plan from billingId lookup over substring matching.
    // This survives plan renames on the Shopify side.
    let resolvedPlan: PlanName = PlanName.FREE;
    if (isActive) {
        const existingPlan = await getShopPlanRecord(shop);
        if (existingPlan?.billingId === subscriptionId && existingPlan.plan === PlanName.PRO) {
            resolvedPlan = PlanName.PRO;
        } else if (planName.toLowerCase().includes("pro")) {
            resolvedPlan = PlanName.PRO;
        }
    }

    await upsertShopPlan(shop, {
        billingId: subscriptionId || undefined,
        status: Object.values(ShopifySubscriptionStatus).includes(normalizedStatus)
            ? normalizedStatus
            : undefined,
        plan: resolvedPlan,
        activatedAt: isActive ? new Date() : undefined,
        cancelledAt: isCancelled ? new Date() : undefined,
    });

    if (isActive) {
        await upsertShop(shop, { status: ShopStatus.ACTIVE });
    } else if (isFrozen) {
        await upsertShop(shop, { status: ShopStatus.SUSPENDED });
    } else if (isTerminated) {
        const terminatedStatus =
            normalizedStatus === ShopifySubscriptionStatus.EXPIRED
                ? ShopStatus.TRIAL_EXPIRED
                : ShopStatus.SUSPENDED;
        await upsertShop(shop, { status: terminatedStatus });
        console.warn(
            `[Subscription] Subscription ${normalizedStatus} for ${shop} — status set to ${terminatedStatus}`,
        );
    }
}

export async function getAccessTokenForShop(shop: string): Promise<string | null> {
    try {
        const session = await findOfflineSessionByShop(shop);
        return session?.accessToken ?? null;
    } catch (error) {
        console.error(`[Billing] Failed to get access token for ${shop}:`, error);
        return null;
    }
}
