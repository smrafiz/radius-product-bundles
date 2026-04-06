"use client";

import { planKeys, useShopStore } from "@/shared";
import { useAppBridge } from "@shopify/app-bridge-react";
import { billingQueries, billingMutations } from "@/features/pricing/api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export function useBillingStatus() {
    const app = useAppBridge();
    const queryClient = useQueryClient();
    const shop = useShopStore((s) => s.shop?.domain ?? "");

    const { data, isLoading, error, refetch } = useQuery(
        billingQueries(app).status(),
    );

    const { mutateAsync: cancelAsync } = useMutation(billingMutations(app).cancel());
    const { mutateAsync: confirmAsync } = useMutation(billingMutations(app).confirm());

    const confirmSubscription = async (chargeId: string): Promise<void> => {
        await confirmAsync({ shop, chargeId });
        await refetch();
        await queryClient.invalidateQueries({ queryKey: planKeys.data() });
    };

    const cancel = async (): Promise<void> => {
        if (!shop) return;
        await cancelAsync();
        await refetch();
        await queryClient.invalidateQueries({ queryKey: planKeys.data() });
    };

    const trialDaysRemaining = (): number | null => {
        if (!data?.trialEndsAt) return null;
        const end = new Date(data.trialEndsAt).getTime();
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
