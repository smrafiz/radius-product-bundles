"use client";

import { LockOverlay, type PlanGateProps, usePlan } from "@/shared";

export function PlanGate({ feature, children, fallbackMode }: PlanGateProps) {
    const { getGateMode } = usePlan();
    const gateMode = fallbackMode ?? getGateMode(feature);

    if (gateMode === "hidden") {
        return null;
    }

    if (gateMode === "lock-overlay") {
        return <LockOverlay feature={feature}>{children}</LockOverlay>;
    }

    return <>{children}</>;
}
