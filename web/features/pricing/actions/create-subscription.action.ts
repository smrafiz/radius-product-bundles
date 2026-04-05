"use server";

import { handleSessionToken } from "@/lib/shopify";
import { executeGraphQLMutation } from "@/lib/graphql/client";
import {
    CreateAppSubscriptionDocument,
    CreateAppSubscriptionMutation,
    CreateAppSubscriptionMutationVariables,
    AppSubscriptionReplacementBehavior,
    AppPricingInterval,
    CurrencyCode,
} from "@/lib/graphql/generated/graphql";
import {
    upsertShopPlan,
} from "@/features/pricing/repositories/shop-plan.repository";
import { ShopifySubscriptionStatus, PlanName } from "@/prisma/generated/client";
import { PRO_TRIAL_DAYS, PRO_MONTHLY_PRICE } from "@/features/pricing/constants/pricing.constants";

const PRO_PLAN_NAME = "Radius Pro";

interface CreateSubscriptionResponse {
    status: "success" | "error";
    confirmationUrl?: string;
    subscription?: {
        id: string;
        status: string;
    };
    error?: string;
}

export async function createSubscriptionAction(
    sessionToken: string,
    _planId?: string,
    interval: "EVERY_30_DAYS" | "ANNUAL" = "EVERY_30_DAYS",
): Promise<CreateSubscriptionResponse> {
    try {
        const { shop, session } = await handleSessionToken(sessionToken);
        const { accessToken } = session;

        if (!accessToken) {
            return { status: "error", error: "No access token" };
        }

        const returnUrl = `${process.env.HOST}/settings/plan`;
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
                                amount: PRO_MONTHLY_PRICE,
                                currencyCode: CurrencyCode.Usd,
                            },
                            interval: interval as AppPricingInterval,
                        },
                    },
                },
            ],
        };

        const result =
            await executeGraphQLMutation<CreateAppSubscriptionMutation>({
                query: CreateAppSubscriptionDocument,
                variables,
                shop,
                accessToken,
            });

        if (result.errors) {
            console.error("[Billing] GraphQL errors:", result.errors);
            return { status: "error", error: "Failed to create subscription" };
        }

        const payload = result.data?.appSubscriptionCreate;
        if (!payload) {
            return { status: "error", error: "No response from Shopify" };
        }

        if (payload.userErrors.length > 0) {
            return {
                status: "error",
                error: payload.userErrors[0]?.message ?? "Shopify billing error",
            };
        }

        const subscription = payload.appSubscription;
        if (!subscription) {
            return { status: "error", error: "Subscription not returned" };
        }

        await upsertShopPlan(shop, {
            billingId: subscription.id,
            plan: PlanName.PRO,
            status: ShopifySubscriptionStatus.PENDING,
            billingInterval: interval,
            trialEndsAt: subscription.trialDays
                ? new Date(
                      Date.now() +
                          subscription.trialDays * 24 * 60 * 60 * 1000,
                  )
                : null,
        });

        return {
            status: "success",
            confirmationUrl: payload.confirmationUrl ?? undefined,
            subscription: {
                id: subscription.id,
                status: subscription.status,
            },
        };
    } catch (error) {
        console.error("[Billing] Subscription error:", error);
        return {
            status: "error",
            error: error instanceof Error ? error.message : "Unknown error",
        };
    }
}
