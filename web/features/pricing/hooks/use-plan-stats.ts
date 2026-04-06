"use client";

import { useAppBridge } from "@shopify/app-bridge-react";
import { useQuery } from "@tanstack/react-query";
import { getPlanStatsAction } from "@/features/pricing/actions/plan-stats.action";

export function usePlanStats() {
    const app = useAppBridge();

    const { data, isLoading } = useQuery({
        queryKey: ["pricing", "plan-stats"],
        queryFn: async () => {
            const token = await app.idToken();
            return getPlanStatsAction(token);
        },
        staleTime: 60_000,
        gcTime: 120_000,
        refetchOnWindowFocus: false,
    });

    return {
        totalRevenue: data?.totalRevenue ?? 0,
        ordersLast30Days: data?.ordersLast30Days ?? 0,
        activeBundles: data?.activeBundles ?? 0,
        isLoading,
    };
}
