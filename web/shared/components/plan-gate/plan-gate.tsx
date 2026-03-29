"use client";

import type { ReactNode } from "react";
import type { FeatureId, GateMode } from "@/shared/types/plan";
import { usePlan } from "@/shared/hooks/plan";
import { LockOverlay } from "./lock-overlay";

interface PlanGateProps {
    feature: FeatureId;
    children: ReactNode;
    fallbackMode?: GateMode;
}

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
