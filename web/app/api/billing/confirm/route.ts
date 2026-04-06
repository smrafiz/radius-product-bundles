import { NextRequest, NextResponse } from "next/server";
import {
    confirmSubscriptionService,
    BillingError,
} from "@/features/pricing/services/subscription.service";
import { authenticateBillingRequest } from "../billing-auth";

export async function POST(request: NextRequest) {
    let shop: string;
    let accessToken: string;

    try {
        ({ shop, accessToken } = await authenticateBillingRequest(request));
    } catch {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const body = (await request.json()) as { chargeId?: string };
        const { chargeId } = body;

        if (!chargeId) {
            return NextResponse.json(
                { error: "Missing chargeId" },
                { status: 400 },
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
