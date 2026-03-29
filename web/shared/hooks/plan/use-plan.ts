"use client";

import { usePlanContext } from "@/shared/components/plan-gate/plan-provider";
import type { PlanContextValue } from "@/shared/types/plan";

export function usePlan(): PlanContextValue {
    return usePlanContext();
}
