import { NextRequest, NextResponse } from "next/server";
import { getShop } from "@/shared/repositories/shop.queries";
import { authenticateBillingRequest } from "../billing-auth";
import {
    createSubscriptionService,
    BillingError,
} from "@/features/pricing/services/subscription.service";
import { BillingInterval } from "@/features/pricing/types/pricing.types";

interface CreateSubscriptionInput {
    planName: string;
    interval: BillingInterval;
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
        const { interval, returnUrl } = body;

        const shopRecord = await getShop(shop);
        if (!shopRecord) {
            return NextResponse.json(
                { error: "Shop not found" },
                { status: 404 },
            );
        }

        const result = await createSubscriptionService(shop, accessToken, interval, returnUrl);

        return NextResponse.json({
            confirmationUrl: result.confirmationUrl,
            subscriptionId: result.subscriptionId,
        });
    } catch (error) {
        if (error instanceof BillingError) {
            if (error.code === "ALREADY_ACTIVE") {
                return NextResponse.json({ error: error.message }, { status: 400 });
            }
            if (error.code === "SHOPIFY_ERROR") {
                return NextResponse.json({ error: error.message }, { status: 500 });
            }
        }
        console.error("[Billing] Error creating subscription:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 },
        );
    }
}
