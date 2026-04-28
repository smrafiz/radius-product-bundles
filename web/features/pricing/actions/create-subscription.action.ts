"use server";

import { handleSessionToken } from "@/lib/shopify";
import { createSubscriptionService } from "@/features/pricing/services/subscription.service";
import type { BillingInterval } from "@/prisma/generated/client";

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

        // billing_status is set to "pending" so the return page can detect
        // a decline (Shopify drops charge_id but preserves our query params).
        const returnUrl = `${process.env.HOST}/pricing/plan?billing_status=pending`;

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
