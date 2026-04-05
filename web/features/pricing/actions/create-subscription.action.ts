"use server";

import { handleSessionToken } from "@/lib/shopify";
import { createSubscriptionService } from "@/features/pricing/services/subscription.service";
import { BillingInterval } from "@/features/pricing/types/pricing.types";

interface CreateSubscriptionResponse {
    status: "success" | "error";
    confirmationUrl?: string;
    subscriptionId?: string;
    error?: string;
}

export async function createSubscriptionAction(
    sessionToken: string,
    _planId?: string,
    interval: BillingInterval = "EVERY_30_DAYS",
): Promise<CreateSubscriptionResponse> {
    try {
        const { shop, session } = await handleSessionToken(sessionToken);
        const { accessToken } = session;

        if (!accessToken) {
            return { status: "error", error: "No access token" };
        }

        const returnUrl = `${process.env.HOST}/settings/plan`;

        const result = await createSubscriptionService(shop, accessToken, interval, returnUrl);

        return {
            status: "success",
            confirmationUrl: result.confirmationUrl,
            subscriptionId: result.subscriptionId,
        };
    } catch (error) {
        console.error("[Billing] Subscription error:", error);
        return {
            status: "error",
            error: error instanceof Error ? error.message : "Unknown error",
        };
    }
}
