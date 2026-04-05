import {
    CancelAppSubscriptionDocument,
    CancelAppSubscriptionMutation,
    CancelAppSubscriptionMutationVariables,
} from "@/lib/graphql/generated/graphql";
import { NextRequest, NextResponse } from "next/server";
import { getShop } from "@/shared/repositories/shop.queries";
import { authenticateBillingRequest } from "../billing-auth";
import {
    getShopPlanRecord,
    cancelShopPlan,
} from "@/features/pricing/repositories/shop-plan.repository";
import { executeGraphQLMutation } from "@/lib/graphql/client";
import { upsertShop } from "@/shared/repositories/shop.queries";

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

        const shopRecord = await getShop(shop);
        if (!shopRecord) {
            return NextResponse.json(
                { error: "Shop not found" },
                { status: 404 },
            );
        }

        const planRecord = await getShopPlanRecord(shop);
        if (!planRecord?.billingId) {
            return NextResponse.json(
                { error: "No active subscription found" },
                { status: 400 },
            );
        }

        const variables: CancelAppSubscriptionMutationVariables = {
            id: planRecord.billingId,
        };

        const result =
            await executeGraphQLMutation<CancelAppSubscriptionMutation>({
                query: CancelAppSubscriptionDocument,
                variables,
                shop,
                accessToken,
            });

        if (result.errors) {
            console.error("[Billing] GraphQL errors:", result.errors);
            return NextResponse.json(
                { error: "Failed to cancel subscription" },
                { status: 500 },
            );
        }

        const payload = result.data?.appSubscriptionCancel;
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

        await cancelShopPlan(shop);
        await upsertShop(shop, { plan: "FREE" });

        return NextResponse.json({
            subscription: payload.appSubscription,
        });
    } catch (error) {
        console.error("[Billing] Error cancelling subscription:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 },
        );
    }
}
