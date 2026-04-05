import type { BillingStatusResponse } from "@/features/pricing/types/pricing.types";

export const BILLING_KEYS = {
    all: ["billing"] as const,
    status: () => [...BILLING_KEYS.all, "status"] as const,
};

export async function fetchBillingStatus(
    shop: string,
): Promise<BillingStatusResponse> {
    const res = await fetch("/api/billing/status", {
        headers: { "x-shop-domain": shop },
    });
    if (!res.ok) {
        throw new Error(`Billing status fetch failed: ${res.status}`);
    }
    return res.json() as Promise<BillingStatusResponse>;
}

export async function cancelSubscription(shop: string): Promise<void> {
    const res = await fetch("/api/billing/cancel", {
        method: "POST",
        headers: { "x-shop-domain": shop },
    });
    if (!res.ok) {
        throw new Error(`Cancel subscription failed: ${res.status}`);
    }
}

export async function confirmSubscriptionFetch(
    shop: string,
    chargeId: string,
): Promise<void> {
    const res = await fetch("/api/billing/confirm", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "x-shop-domain": shop,
        },
        body: JSON.stringify({ chargeId }),
    });
    if (!res.ok) {
        const body = (await res.json().catch(() => ({}))) as {
            error?: string;
        };
        throw new Error(
            body.error ?? `Subscription confirmation failed: ${res.status}`,
        );
    }
}
