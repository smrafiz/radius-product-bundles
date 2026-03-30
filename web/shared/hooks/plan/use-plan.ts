"use client";

import { useContext } from "react";
import type { PlanContextValue } from "@/shared/types/plan";
import { PlanContext } from "@/shared/components/providers/plan-provider";

export function usePlan(): PlanContextValue {
    const ctx = useContext(PlanContext);
    if (!ctx) {
        throw new Error("usePlan must be used within PlanProvider");
    }
    return ctx;
}
