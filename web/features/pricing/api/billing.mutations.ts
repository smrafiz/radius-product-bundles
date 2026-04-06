import { MutationOptions } from "@tanstack/react-query";
import { useAppBridge } from "@shopify/app-bridge-react";

async function cancelSubscriptionFetch(sessionToken: string): Promise<void> {
    const res = await fetch("/api/billing/cancel", {
        method: "POST",
        headers: { Authorization: `Bearer ${sessionToken}` },
    });
    if (!res.ok) {
        throw new Error(`Cancel subscription failed: ${res.status}`);
    }
}

async function confirmSubscriptionFetch(
    shop: string,
    chargeId: string,
    sessionToken: string,
): Promise<void> {
    const res = await fetch("/api/billing/confirm", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${sessionToken}`,
        },
        body: JSON.stringify({ chargeId }),
    });
    if (!res.ok) {
        const body = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(body.error ?? `Subscription confirmation failed: ${res.status}`);
    }
}

export function billingMutations(app: ReturnType<typeof useAppBridge>) {
    return {
        cancel: (): MutationOptions<void, Error, void> => ({
            mutationFn: async () => {
                const token = await app.idToken();
                await cancelSubscriptionFetch(token);
            },
        }),

        confirm: (): MutationOptions<void, Error, { shop: string; chargeId: string }> => ({
            mutationFn: async ({ shop, chargeId }) => {
                const token = await app.idToken();
                await confirmSubscriptionFetch(shop, chargeId, token);
            },
        }),
    };
}
