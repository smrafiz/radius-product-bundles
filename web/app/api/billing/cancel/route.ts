import { NextRequest, NextResponse } from "next/server";
import { getShop } from "@/shared/repositories/shop.queries";
import { authenticateBillingRequest } from "../billing-auth";
import {
    cancelSubscriptionService,
    BillingError,
} from "@/features/pricing/services/subscription.service";

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

        await cancelSubscriptionService(shop, accessToken);

        return NextResponse.json({ success: true });
    } catch (error) {
        if (error instanceof BillingError) {
            if (error.code === "NO_SUBSCRIPTION") {
                return NextResponse.json({ error: error.message }, { status: 400 });
            }
            if (error.code === "SHOPIFY_ERROR") {
                return NextResponse.json({ error: error.message }, { status: 500 });
            }
        }
        console.error("[Billing] Error cancelling subscription:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 },
        );
    }
}
