"use client";

import {
    createContext,
    useContext,
    useEffect,
    useState,
    type ReactNode,
} from "react";
import { useAppBridge } from "@shopify/app-bridge-react";
import type {
    ClientPlanData,
    FeatureId,
    GateMode,
    PlanConfig,
    PlanContextValue,
} from "@/shared/types/plan";
import { PLAN_CONFIGS, DEFAULT_PLAN_ID } from "@/shared/constants";
import { fetchPlanData } from "@/shared/actions/plan.actions";

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
    const app = useAppBridge();

    useEffect(() => {
        if (!app) return;

        const loadPlanData = async () => {
            try {
                const token = await app.idToken();
                if (!token) return;

                const result = await fetchPlanData(token);

                if (result.status === "success" && result.data) {
                    setPlanData(buildContextValue(result.data));
                } else {
                    console.warn("[PlanProvider] Failed to fetch plan data:", result.message);
                }
            } catch (err) {
                console.warn("[PlanProvider] Error fetching plan data:", err);
            }
        };

        void loadPlanData();
    }, [app]);

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
