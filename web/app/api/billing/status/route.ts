import {
    GetActiveSubscriptionDocument,
    GetActiveSubscriptionQuery,
} from "@/lib/graphql/generated/graphql";
import { NextRequest, NextResponse } from "next/server";
import { executeGraphQLQuery } from "@/lib/graphql/client";
import { getShop } from "@/shared/repositories/shop.queries";
import { authenticateBillingRequest } from "../billing-auth";
import { getShopPlanRecord } from "@/features/pricing/repositories/shop-plan.repository";

export async function GET(request: NextRequest) {
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

        const shopRecord = await getShop(shop);
        if (!shopRecord) {
            return NextResponse.json(
                { error: "Shop not found" },
                { status: 404 },
            );
        }

        const localPlan = await getShopPlanRecord(shop);

        const result = await executeGraphQLQuery<GetActiveSubscriptionQuery>({
            query: GetActiveSubscriptionDocument,
            variables: {},
            shop,
            accessToken,
        });

        if (result.errors) {
            console.error("[Billing] GraphQL errors:", result.errors);
            return NextResponse.json(
                { error: "Failed to fetch subscription" },
                { status: 500 },
            );
        }

        const subscriptions =
            result.data?.currentAppInstallation?.activeSubscriptions ?? [];

        if (subscriptions.length === 0) {
            return NextResponse.json({
                subscription: null,
                localStatus: localPlan?.status ?? null,
                trialEndsAt: localPlan?.trialEndsAt?.toISOString() ?? null,
                status: "NO_SUBSCRIPTION",
            });
        }

        const sub = subscriptions[0];
        const lineItem = sub.lineItems?.[0];
        const pricingDetails = lineItem?.plan?.pricingDetails;
        const pricing =
            pricingDetails && "__typename" in pricingDetails &&
            pricingDetails.__typename === "AppRecurringPricing"
                ? pricingDetails
                : null;

        return NextResponse.json({
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
        });
    } catch (error) {
        console.error("[Billing] Error fetching subscription:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 },
        );
    }
}
