"use client";

import { planKeys, useShopStore } from "@/shared";
import { useAppBridge } from "@shopify/app-bridge-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
    BILLING_KEYS,
    cancelSubscription,
    confirmSubscriptionFetch,
    fetchBillingStatus,
} from "../api/billing.queries";

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
        await confirmSubscriptionFetch(shop, chargeId);
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
