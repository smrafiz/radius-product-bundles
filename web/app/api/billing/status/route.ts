import { NextRequest, NextResponse } from "next/server";
import { getShop } from "@/shared/repositories/shop.queries";
import { authenticateBillingRequest } from "../billing-auth";
import {
    getSubscriptionStatusService,
    BillingError,
} from "@/features/pricing/services/subscription.service";

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

        const data = await getSubscriptionStatusService(shop, accessToken);

        return NextResponse.json(data);
    } catch (error) {
        if (error instanceof BillingError && error.code === "SHOPIFY_ERROR") {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }
        console.error("[Billing] Error fetching subscription:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 },
        );
    }
}
