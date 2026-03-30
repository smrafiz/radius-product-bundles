"use server";

import {
    checkBundleQuota,
    getEffectiveLimits,
    resolveShopPlan,
} from "@/shared/services/plan.service";
import { handleSessionToken } from "@/lib/shopify";
import { type ApiResponse, type ClientPlanData } from "@/shared";

export async function fetchPlanData(
    sessionToken: string,
): Promise<ApiResponse<ClientPlanData>> {
    try {
        const {
            session: { shop },
        } = await handleSessionToken(sessionToken);

        const plan = await resolveShopPlan(shop);
        const limits = await getEffectiveLimits(shop);
        const bundleQuota = await checkBundleQuota(shop);

        return {
            status: "success",
            data: {
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
            },
        };
    } catch (error) {
        console.error("[fetchPlanData] Error:", error);

        return {
            status: "error",
            message:
                error instanceof Error
                    ? error.message
                    : "Failed to fetch plan data",
        };
    }
}
