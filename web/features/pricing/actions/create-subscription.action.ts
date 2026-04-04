"use server";

import {
    SUBSCRIPTION_PLANS,
    PLAN_PRICING,
    SubscriptionPlanType,
} from "@/features/pricing";
import { handleSessionToken } from "@/lib/shopify";

interface CreateSubscriptionResponse {
    status: "success" | "error";
    confirmationUrl?: string;
    subscription?: {
        id: string;
        status: string;
    };
    error?: string;
}

export async function createSubscriptionAction(
    sessionToken: string,
    planId: SubscriptionPlanType,
): Promise<CreateSubscriptionResponse> {
    try {
        const { session } = await handleSessionToken(sessionToken);
        const { shop, accessToken } = session;

        if (!accessToken) {
            return { status: "error", error: "No access token" };
        }

        const pricing = PLAN_PRICING[planId];
        if (!pricing) {
            return { status: "error", error: "Invalid plan" };
        }

        const planNames: Record<SubscriptionPlanType, string> = {
            [SUBSCRIPTION_PLANS.FREE]: "Free Plan",
            [SUBSCRIPTION_PLANS.STARTER]: "Starter Plan",
            [SUBSCRIPTION_PLANS.PREMIUM]: "Pro Plan",
        };

        const response = await fetch(`${process.env.HOST}/api/billing/create`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "x-shop-domain": shop,
            },
            body: JSON.stringify({
                planName: planNames[planId],
                price: pricing.price,
                currencyCode: pricing.currencyCode,
                interval: pricing.interval,
                returnUrl: `${process.env.HOST}/settings/plan`,
                trialDays: pricing.trialDays,
            }),
        });

        const data = await response.json();

        if (!response.ok || data.errors) {
            console.error("[Billing] Subscription error:", data);
            return {
                status: "error",
                error:
                    data.errors?.[0]?.message ||
                    "Failed to create subscription",
            };
        }

        return {
            status: "success",
            confirmationUrl: data.confirmationUrl,
            subscription: data.subscription,
        };
    } catch (error) {
        console.error("[Billing] Subscription error:", error);
        return {
            status: "error",
            error: error instanceof Error ? error.message : "Unknown error",
        };
    }
}
