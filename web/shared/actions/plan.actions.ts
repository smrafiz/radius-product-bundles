"use server";

import { handleSessionToken } from "@/lib/shopify";
import type { ApiResponse, ClientPlanData } from "@/shared";
import { getFullPlanData } from "@/shared/services/plan.service";

export async function fetchPlanData(
    sessionToken: string,
): Promise<ApiResponse<ClientPlanData>> {
    try {
        const {
            session: { shop },
        } = await handleSessionToken(sessionToken);

        const { plan, bundleQuota } = await getFullPlanData(shop);

        return {
            status: "success",
            data: {
                planId: plan.id,
                planName: plan.name,
                limits: plan.limits,
                features: plan.features,
                quota: {
                    bundles: bundleQuota,
                    products: {
                        allowed: true,
                        current: 0,
                        limit: plan.limits.maxProductsPerBundle,
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
