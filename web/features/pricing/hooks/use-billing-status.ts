"use client";

import { planKeys, useShopStore } from "@/shared";
import { useAppBridge } from "@shopify/app-bridge-react";
import type { BillingStatusResponse } from "@/features/pricing";
import { useQuery, useQueryClient } from "@tanstack/react-query";

const BILLING_KEYS = {
    all: ["billing"] as const,
    status: () => [...BILLING_KEYS.all, "status"] as const,
};

async function fetchBillingStatus(
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

async function cancelSubscription(shop: string): Promise<void> {
    const res = await fetch("/api/billing/cancel", {
        method: "POST",
        headers: { "x-shop-domain": shop },
    });
    if (!res.ok) {
        throw new Error(`Cancel subscription failed: ${res.status}`);
    }
}

export function useBillingStatus() {
    const app = useAppBridge();
    const queryClient = useQueryClient();
    const shop = useShopStore((s) => s.shop?.domain ?? "");

    const { data, isLoading, error, refetch } = useQuery({
        queryKey: BILLING_KEYS.status(),
        queryFn: () => fetchBillingStatus(shop),
        enabled: !!shop && !!app,
        staleTime: 30_000,
    });

    const confirmSubscription = async (chargeId: string): Promise<void> => {
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
        await refetch();
        await queryClient.invalidateQueries({ queryKey: planKeys.data() });
    };

    const cancel = async (): Promise<void> => {
        if (!shop) return;
        await cancelSubscription(shop);
        await refetch();
        await queryClient.invalidateQueries({ queryKey: planKeys.data() });
    };

    const trialDaysRemaining = (): number | null => {
        const sub = data?.subscription;
        if (!sub?.currentPeriodEnd) return null;
        const end = new Date(sub.currentPeriodEnd).getTime();
        const now = Date.now();
        if (end <= now) return null;
        return Math.ceil((end - now) / (1000 * 60 * 60 * 24));
    };

    return {
        billingData: data ?? null,
        isLoading,
        error,
        refetch,
        confirmSubscription,
        cancel,
        trialDaysRemaining,
    };
}
