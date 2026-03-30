"use client";

import {
    createContext,
    useCallback,
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

function buildContextValue(
    data: ClientPlanData,
    refreshPlan: () => Promise<void>,
): PlanContextValue {
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
        refreshPlan,
    };
}

export function PlanProvider({ children }: { children: ReactNode }) {
    const app = useAppBridge();

    const loadPlanData = useCallback(async () => {
        if (!app) {
            return;
        }

        try {
            const token = await app.idToken();
            if (!token) {
                return;
            }

            const result = await fetchPlanData(token);

            if (result.status === "success" && result.data) {
                setPlanData(buildContextValue(result.data, loadPlanData));
            } else {
                console.warn("[PlanProvider] Failed to fetch plan data:", result.message);
            }
        } catch (err) {
            console.warn("[PlanProvider] Error fetching plan data:", err);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [app]);

    const [planData, setPlanData] = useState<PlanContextValue>(() =>
        buildContextValue(
            {
                planId: DEFAULT_PLAN_ID,
                planName: "Free",
                limits: PLAN_CONFIGS[DEFAULT_PLAN_ID].limits,
                features: PLAN_CONFIGS[DEFAULT_PLAN_ID].features,
                quota: {
                    bundles: { allowed: true, current: 0, limit: 5 },
                    products: { allowed: true, current: 0, limit: 10 },
                },
            },
            loadPlanData,
        ),
    );

    useEffect(() => {
        void loadPlanData();
    }, [loadPlanData]);

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
