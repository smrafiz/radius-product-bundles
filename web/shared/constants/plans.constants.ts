import type { PlanConfig, PlanId } from "@/shared";

export const DEFAULT_PLAN_ID: PlanId = "FREE";

export const PLAN_CONFIGS: Record<PlanId, PlanConfig> = {
    FREE: {
        id: "FREE",
        name: "Free",
        limits: {
            maxBundles: 5,
            maxProductsPerBundle: 10,
            allowedLayouts: {
                FIXED_BUNDLE: ["GRID", "LIST"],
                BOGO: ["CLASSIC_CARD", "COMPACT_GRID"],
                BUY_X_GET_Y: ["COMPACT_GRID", "MINIMALIST"],
            },
            allowedBundleTypes: ["FIXED_BUNDLE", "BOGO", "BUY_X_GET_Y"],
            allowedStatuses: ["DRAFT", "ACTIVE", "ARCHIVED"],
        },
        features: [
            { feature: "analytics_full", gateMode: "enabled" },
            { feature: "ab_testing", gateMode: "hidden" },
            { feature: "automation", gateMode: "hidden" },
            { feature: "ai_insights", gateMode: "hidden" },
            { feature: "custom_css", gateMode: "hidden" },
            { feature: "responsive_overrides", gateMode: "hidden" },
            { feature: "templates", gateMode: "hidden" },
            { feature: "export_data", gateMode: "hidden" },
            { feature: "remove_branding", gateMode: "hidden" },
        ],
    },
};
