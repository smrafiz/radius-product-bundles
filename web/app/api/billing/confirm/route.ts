import { NextRequest, NextResponse } from "next/server";
import { getShop } from "@/shared/repositories/shop.queries";
import {
    confirmSubscriptionService,
    getAccessTokenForShop,
    BillingError,
} from "@/features/pricing/services/subscription.service";

export async function POST(request: NextRequest) {
    try {
        const shop = request.headers.get("x-shop-domain");

        if (!shop) {
            return NextResponse.json(
                { error: "Missing shop domain" },
                { status: 400 },
            );
        }

        const body = (await request.json()) as { chargeId?: string };
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

        await confirmSubscriptionService(shop, accessToken, chargeId);

        return NextResponse.json({ success: true, plan: "PRO" });
    } catch (error) {
        if (error instanceof BillingError) {
            if (error.code === "NOT_FOUND") {
                return NextResponse.json(
                    { error: error.message, status: "NOT_FOUND" },
                    { status: 404 },
                );
            }
            if (error.code === "SHOPIFY_ERROR") {
                return NextResponse.json({ error: error.message }, { status: 500 });
            }
        }
        console.error("[Billing] Error confirming subscription:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 },
        );
    }
}
