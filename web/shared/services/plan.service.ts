import { DEFAULT_PLAN_ID, PLAN_CONFIGS } from "@/shared/constants";
import type {
    FeatureId,
    GateMode,
    PlanConfig,
    PlanGateResult,
    PlanId,
    PlanLimits,
    QuotaResult,
} from "@/shared/types/plan";
import { getShopPlan } from "@/shared/repositories";
import { countBundlesByShop } from "@/features/bundles/repositories";

export function getPlanConfig(planId: PlanId): PlanConfig {
    const config = PLAN_CONFIGS[planId];
    if (!config) {
        console.warn(`[Plan] Unknown plan "${planId}", falling back to FREE`);
        return PLAN_CONFIGS[DEFAULT_PLAN_ID];
    }
    return config;
}

export async function resolveShopPlan(domain: string): Promise<PlanConfig> {
    const planId = (await getShopPlan(domain)) ?? DEFAULT_PLAN_ID;
    return getPlanConfig(planId);
}

export async function getEffectiveLimits(
    domain: string,
): Promise<PlanLimits> {
    const plan = await resolveShopPlan(domain);
    return plan.limits;
}

export function getFeatureGateMode(
    planConfig: PlanConfig,
    feature: FeatureId,
): GateMode {
    const featureConfig = planConfig.features.find(
        (f) => f.feature === feature,
    );
    return featureConfig?.gateMode ?? "hidden";
}

export function hasFeature(planConfig: PlanConfig, feature: FeatureId): boolean {
    return getFeatureGateMode(planConfig, feature) === "enabled";
}

export async function checkPlanFeature(
    domain: string,
    feature: FeatureId,
): Promise<PlanGateResult> {
    const plan = await resolveShopPlan(domain);
    const gateMode = getFeatureGateMode(plan, feature);

    return {
        allowed: gateMode === "enabled",
        gated: gateMode !== "enabled",
        feature,
        gateMode,
        message:
            gateMode === "enabled"
                ? "Feature available"
                : `This feature requires a paid plan`,
    };
}

export async function checkBundleTypeAllowed(
    domain: string,
    bundleType: string,
): Promise<PlanGateResult> {
    const limits = await getEffectiveLimits(domain);
    const allowed = limits.allowedBundleTypes.includes(bundleType as any);

    return {
        allowed,
        gated: !allowed,
        feature: bundleType,
        gateMode: allowed ? "enabled" : "lock-overlay",
        message: allowed
            ? "Bundle type available"
            : `${bundleType} requires a paid plan`,
    };
}

export async function checkBundleStatusAllowed(
    domain: string,
    status: string,
): Promise<PlanGateResult> {
    const limits = await getEffectiveLimits(domain);
    const allowed = limits.allowedStatuses.includes(status as any);

    return {
        allowed,
        gated: !allowed,
        feature: status,
        gateMode: allowed ? "enabled" : "lock-overlay",
        message: allowed
            ? "Bundle status available"
            : `${status} status requires a paid plan`,
    };
}

export async function checkBundleQuota(
    domain: string,
): Promise<QuotaResult> {
    const limits = await getEffectiveLimits(domain);
    const current = await countBundlesByShop(domain);

    if (limits.maxBundles === -1) {
        return { allowed: true, current, limit: -1 };
    }

    return {
        allowed: current < limits.maxBundles,
        current,
        limit: limits.maxBundles,
    };
}
