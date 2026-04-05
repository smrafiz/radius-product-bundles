import {
    GetActiveSubscriptionDocument,
    GetActiveSubscriptionQuery,
} from "@/lib/graphql/generated/graphql";
import { NextRequest, NextResponse } from "next/server";
import { getShop } from "@/shared/repositories/shop.queries";
import { executeGraphQLQuery } from "@/lib/graphql/client";
import {
    upsertShopPlan,
} from "@/features/pricing/repositories/shop-plan.repository";
import { upsertShop } from "@/shared/repositories/shop.queries";
import { findOfflineSessionByShop } from "@/shared/repositories";
import { ShopifySubscriptionStatus, PlanName } from "@/prisma/generated/client";

async function getAccessTokenForShop(shop: string): Promise<string | null> {
    try {
        const session = await findOfflineSessionByShop(shop);
        return session?.accessToken || null;
    } catch (error) {
        console.error(`[Billing] Failed to get access token for ${shop}:`, error);
        return null;
    }
}

export async function POST(request: NextRequest) {
    try {
        const shop = request.headers.get("x-shop-domain");

        if (!shop) {
            return NextResponse.json(
                { error: "Missing shop domain" },
                { status: 400 },
            );
        }

        const body = await request.json() as { chargeId?: string };
        const { chargeId } = body;

        if (!chargeId) {
            return NextResponse.json(
                { error: "Missing chargeId" },
                { status: 400 },
            );
        }

        const shopRecord = await getShop(shop);
        if (!shopRecord) {
            return NextResponse.json(
                { error: "Shop not found" },
                { status: 404 },
            );
        }

        const accessToken = await getAccessTokenForShop(shop);
        if (!accessToken) {
            return NextResponse.json(
                { error: "Shop authentication required" },
                { status: 401 },
            );
        }

        const result = await executeGraphQLQuery<GetActiveSubscriptionQuery>({
            query: GetActiveSubscriptionDocument,
            variables: {},
            shop,
            accessToken,
        });

        if (result.errors) {
            console.error("[Billing] GraphQL errors:", result.errors);
            return NextResponse.json(
                { error: "Failed to fetch subscription from Shopify" },
                { status: 500 },
            );
        }

        const subscriptions =
            result.data?.currentAppInstallation?.activeSubscriptions ?? [];

        const matchedSub = subscriptions.find((s) => s.id === chargeId);

        if (!matchedSub) {
            return NextResponse.json(
                { error: "Subscription not found or not active", status: "NOT_FOUND" },
                { status: 404 },
            );
        }

        const subStatus = matchedSub.status.toUpperCase() as ShopifySubscriptionStatus;
        const isActive = subStatus === ShopifySubscriptionStatus.ACTIVE;

        if (!isActive) {
            return NextResponse.json(
                { error: "Subscription is not active", status: matchedSub.status },
                { status: 402 },
            );
        }

        const lineItem = matchedSub.lineItems?.[0];
        const pricingDetails = lineItem?.plan?.pricingDetails;
        const pricing =
            pricingDetails && "__typename" in pricingDetails &&
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

        await upsertShop(shop, { plan: "PRO" });

        return NextResponse.json({ success: true, plan: "PRO" });
    } catch (error) {
        console.error("[Billing] Error confirming subscription:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 },
        );
    }
}
