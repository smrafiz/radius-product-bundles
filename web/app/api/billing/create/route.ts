import {
    CreateAppSubscriptionDocument,
    CreateAppSubscriptionMutation,
    CreateAppSubscriptionMutationVariables,
    AppSubscriptionReplacementBehavior,
    AppPricingInterval,
    CurrencyCode,
} from "@/lib/graphql/generated/graphql";
import {
    PRO_MONTHLY_PRICE,
    PRO_ANNUAL_PRICE,
    PRO_TRIAL_DAYS,
    BILLING_CURRENCY,
} from "@/features/pricing/constants/pricing.constants";
import { NextRequest, NextResponse } from "next/server";
import { getShop } from "@/shared/repositories/shop.queries";
import { authenticateBillingRequest } from "../billing-auth";
import { executeGraphQLMutation } from "@/lib/graphql/client";
import {
    getShopPlanRecord,
    upsertShopPlan,
} from "@/features/pricing/repositories/shop-plan.repository";
import { ShopifySubscriptionStatus, PlanName } from "@/prisma/generated/client";

interface CreateSubscriptionInput {
    planName: string;
    interval: "EVERY_30_DAYS" | "ANNUAL";
    returnUrl: string;
}

export async function POST(request: NextRequest) {
    try {
        let shop: string;
        let accessToken: string;

        try {
            ({ shop, accessToken } = await authenticateBillingRequest(request));
        } catch {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 },
            );
        }

        const body = (await request.json()) as CreateSubscriptionInput;
        const { planName, interval, returnUrl } = body;

        const shopRecord = await getShop(shop);
        if (!shopRecord) {
            return NextResponse.json(
                { error: "Shop not found" },
                { status: 404 },
            );
        }

        const existingPlan = await getShopPlanRecord(shop);
        if (existingPlan?.status === ShopifySubscriptionStatus.ACTIVE) {
            return NextResponse.json(
                { error: "Already has active subscription" },
                { status: 400 },
            );
        }

        const price =
            interval === "ANNUAL" ? PRO_ANNUAL_PRICE : PRO_MONTHLY_PRICE;

        const isTest = process.env.NODE_ENV !== "production";
        const variables: CreateAppSubscriptionMutationVariables = {
            name: planName,
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

        const result =
            await executeGraphQLMutation<CreateAppSubscriptionMutation>({
                query: CreateAppSubscriptionDocument,
                variables,
                shop,
                accessToken,
            });

        if (result.errors) {
            console.error("[Billing] GraphQL errors:", result.errors);
            return NextResponse.json(
                { error: "Failed to create subscription" },
                { status: 500 },
            );
        }

        const payload = result.data?.appSubscriptionCreate;
        if (!payload) {
            return NextResponse.json(
                { error: "No response from Shopify" },
                { status: 500 },
            );
        }

        if (payload.userErrors.length > 0) {
            return NextResponse.json(
                { errors: payload.userErrors },
                { status: 400 },
            );
        }

        const subscription = payload.appSubscription;
        if (!subscription) {
            return NextResponse.json(
                { error: "Subscription not returned" },
                { status: 500 },
            );
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

        return NextResponse.json({
            subscription: {
                id: subscription.id,
                status: subscription.status,
                createdAt: subscription.createdAt,
            },
            confirmationUrl: payload.confirmationUrl,
        });
    } catch (error) {
        console.error("[Billing] Error creating subscription:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 },
        );
    }
}
