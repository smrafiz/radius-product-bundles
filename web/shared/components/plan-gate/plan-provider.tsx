"use client";

import {
    createContext,
    useContext,
    useEffect,
    useState,
    type ReactNode,
} from "react";
import type {
    ClientPlanData,
    FeatureId,
    GateMode,
    PlanConfig,
    PlanContextValue,
} from "@/shared/types/plan";
import { PLAN_CONFIGS, DEFAULT_PLAN_ID } from "@/shared/constants";
import { fetchPlanData } from "@/shared/actions/plan.actions";
import { useShopStore } from "@/shared";

const PlanContext = createContext<PlanContextValue | null>(null);

function buildContextValue(data: ClientPlanData): PlanContextValue {
    const planConfig = PLAN_CONFIGS[data.planId] ?? PLAN_CONFIGS[DEFAULT_PLAN_ID];

    return {
        plan: { ...planConfig, limits: data.limits },
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
    };
}

const DEFAULT_CONTEXT: PlanContextValue = buildContextValue({
    planId: DEFAULT_PLAN_ID,
    planName: "Free",
    limits: PLAN_CONFIGS[DEFAULT_PLAN_ID].limits,
    features: PLAN_CONFIGS[DEFAULT_PLAN_ID].features,
    quota: {
        bundles: { allowed: true, current: 0, limit: 5 },
        products: { allowed: true, current: 0, limit: 10 },
    },
});

export function PlanProvider({ children }: { children: ReactNode }) {
    const [planData, setPlanData] = useState<PlanContextValue>(DEFAULT_CONTEXT);
    const shopDomain = useShopStore((s) => s.shop?.domain);

    useEffect(() => {
        if (!shopDomain) return;

        fetchPlanData(shopDomain).then((data) => {
            setPlanData(buildContextValue(data));
        }).catch((err) => {
            console.warn("[PlanProvider] Failed to fetch plan data:", err);
        });
    }, [shopDomain]);

    return (
        <PlanContext.Provider value={planData}>{children}</PlanContext.Provider>
    );
}

export function usePlanContext(): PlanContextValue {
    const ctx = useContext(PlanContext);
    if (!ctx) {
        throw new Error("usePlanContext must be used within PlanProvider");
    }
    return ctx;
}
