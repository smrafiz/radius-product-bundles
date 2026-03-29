"use server";

import type { ClientPlanData } from "@/shared/types/plan";
import {
    resolveShopPlan,
    getEffectiveLimits,
    checkBundleQuota,
} from "@/shared/services/plan.service";

export async function fetchPlanData(
    domain: string,
): Promise<ClientPlanData> {
    const plan = await resolveShopPlan(domain);
    const limits = await getEffectiveLimits(domain);
    const bundleQuota = await checkBundleQuota(domain);

    return {
        planId: plan.id,
        planName: plan.name,
        limits,
        features: plan.features,
        quota: {
            bundles: bundleQuota,
            products: {
                allowed: true,
                current: 0,
                limit: limits.maxProductsPerBundle,
            },
        },
    };
}
