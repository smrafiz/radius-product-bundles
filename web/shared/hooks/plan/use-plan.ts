"use client";

import type { PlanContextValue } from "@/shared/types/plan";
import { usePlanContext } from "@/shared/components/providers/plan-provider";

export function usePlan(): PlanContextValue {
    return usePlanContext();
}
