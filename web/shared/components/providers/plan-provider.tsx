"use client";

import { createContext, type ReactNode, useMemo } from "react";
import { useAppBridge } from "@shopify/app-bridge-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import type {
    ClientPlanData,
    FeatureId,
    GateMode,
    PlanContextValue,
} from "@/shared/types/plan";
import { planKeys, planQueries } from "@/shared/api";
import { DEFAULT_PLAN_ID, PLAN_CONFIGS } from "@/shared/constants";

const DEFAULT_PLAN_DATA: ClientPlanData = {
    planId: DEFAULT_PLAN_ID,
    planName: "Free",
    limits: PLAN_CONFIGS[DEFAULT_PLAN_ID].limits,
    features: PLAN_CONFIGS[DEFAULT_PLAN_ID].features,
    quota: {
        bundles: { allowed: true, current: 0, limit: 5 },
        products: { allowed: true, current: 0, limit: 10 },
    },
};

export const PlanContext = createContext<PlanContextValue | null>(null);

export function PlanProvider({ children }: { children: ReactNode }) {
    const app = useAppBridge();
    const queryClient = useQueryClient();

    const { data: planData, isLoading } = useQuery({
        ...planQueries(app).data(),
        enabled: !!app,
    });

    const data = planData ?? DEFAULT_PLAN_DATA;

    const contextValue = useMemo((): PlanContextValue => {
        const planConfig =
            PLAN_CONFIGS[data.planId] ?? PLAN_CONFIGS[DEFAULT_PLAN_ID];

        return {
            plan: { ...planConfig, limits: data.limits },
            isLoading,
            canUse: (feature: FeatureId) => {
                const f = data.features.find((fc) => fc.feature === feature);
                return f?.gateMode === "enabled";
            },
            getGateMode: (feature: FeatureId): GateMode => {
                const f = data.features.find((fc) => fc.feature === feature);
                return f?.gateMode ?? "hidden";
            },
            isWithinQuota: (resource: "bundles" | "products") => {
                const q = data.quota[resource];
                return q.limit === -1 || q.current < q.limit;
            },
            quota: data.quota,
            refreshPlan: async () => {
                await queryClient.invalidateQueries({
                    queryKey: planKeys.data(),
                });
            },
        };
    }, [data, isLoading, queryClient]);

    return (
        <PlanContext.Provider value={contextValue}>
            {children}
        </PlanContext.Provider>
    );
}
