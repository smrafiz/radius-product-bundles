import type { ReactNode } from "react";
import type { BundleType, BundleStatus } from "@/features/bundles";

export type PlanId = "FREE" | (string & {});

export type GateMode = "enabled" | "lock-overlay" | "hidden";

export type FeatureId =
    | "analytics_full"
    | "ab_testing"
    | "automation"
    | "ai_insights"
    | "custom_css"
    | "responsive_overrides"
    | "templates"
    | "export_data"
    | "remove_branding";

export interface PlanFeatureConfig {
    feature: FeatureId;
    gateMode: GateMode;
}

export interface PlanLimits {
    maxBundles: number;
    maxProductsPerBundle: number;
    allowedBundleTypes: BundleType[];
    allowedStatuses: BundleStatus[];
}

export interface PlanConfig {
    id: PlanId;
    name: string;
    limits: PlanLimits;
    features: PlanFeatureConfig[];
}

export interface QuotaResult {
    allowed: boolean;
    current: number;
    limit: number;
}

export interface PlanGateResult {
    allowed: boolean;
    gated: boolean;
    feature: FeatureId | string;
    gateMode: GateMode;
    message: string;
}

export interface PlanContextValue {
    plan: PlanConfig;
    canUse: (feature: FeatureId) => boolean;
    getGateMode: (feature: FeatureId) => GateMode;
    isWithinQuota: (resource: "bundles" | "products") => boolean;
    quota: {
        bundles: QuotaResult;
        products: QuotaResult;
    };
    refreshPlan: () => Promise<void>;
}

export interface ClientPlanData {
    planId: PlanId;
    planName: string;
    limits: PlanLimits;
    features: PlanFeatureConfig[];
    quota: {
        bundles: QuotaResult;
        products: QuotaResult;
    };
}

export interface PlanGateProps {
    feature: FeatureId;
    children: ReactNode;
    fallbackMode?: GateMode;
}

export interface LockOverlayProps {
    feature: FeatureId;
    children: ReactNode;
}

export interface QuotaBarProps {
    resource: "bundles" | "products";
    label?: string;
}
