import type { PlanConfig, PlanId } from "@/shared";

export const DEFAULT_PLAN_ID: PlanId = "FREE";

const DEV_UNLOCK_ALL = process.env.NEXT_PUBLIC_UNLOCK_ALL_FEATURES === "true";

const FREE_CONFIG: PlanConfig = {
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
        allowedDiscountTypes: ["PERCENTAGE", "FIXED_AMOUNT", "NO_DISCOUNT"],
    },
    features: [
        { feature: "analytics_full", gateMode: "lock-overlay" },
        { feature: "ab_testing", gateMode: "lock-overlay" },
        { feature: "automation", gateMode: "lock-overlay" },
        { feature: "ai_insights", gateMode: "lock-overlay" },
        { feature: "custom_css", gateMode: "lock-overlay" },
        { feature: "responsive_overrides", gateMode: "lock-overlay" },
        { feature: "templates", gateMode: "lock-overlay" },
        { feature: "export_data", gateMode: "lock-overlay" },
        { feature: "remove_branding", gateMode: "lock-overlay" },
        { feature: "duplicate_bundle", gateMode: "lock-overlay" },
        { feature: "bundle_behavior", gateMode: "lock-overlay" },
        { feature: "advanced_discount_controls", gateMode: "lock-overlay" },
        { feature: "advanced_cart_controls", gateMode: "lock-overlay" },
        { feature: "auto_translate", gateMode: "lock-overlay" },
    ],
};

function unlockAll(config: PlanConfig): PlanConfig {
    return {
        ...config,
        name: `${config.name} (Dev Unlocked)`,
        limits: {
            ...config.limits,
            maxBundles: -1,
            maxProductsPerBundle: -1,
            allowedLayouts: {},
            allowedStatuses: ["DRAFT", "ACTIVE", "PAUSED", "SCHEDULED", "ARCHIVED"],
            allowedDiscountTypes: ["PERCENTAGE", "FIXED_AMOUNT", "CUSTOM_PRICE", "NO_DISCOUNT"],
        },
        features: config.features.map((f) => ({
            ...f,
            gateMode: "enabled" as const,
        })),
    };
}

const PRO_CONFIG: PlanConfig = {
    id: "PRO",
    name: "Pro",
    limits: {
        maxBundles: -1,
        maxProductsPerBundle: -1,
        allowedLayouts: {},
        allowedBundleTypes: ["FIXED_BUNDLE", "BOGO", "BUY_X_GET_Y", "VOLUME_DISCOUNT", "MIX_AND_MATCH", "FREQUENTLY_BOUGHT_TOGETHER"],
        allowedStatuses: ["DRAFT", "ACTIVE", "PAUSED", "SCHEDULED", "ARCHIVED"],
        allowedDiscountTypes: ["PERCENTAGE", "FIXED_AMOUNT", "CUSTOM_PRICE", "NO_DISCOUNT", "QUANTITY_BREAKS"],
    },
    features: [
        { feature: "analytics_full", gateMode: "enabled" },
        { feature: "ab_testing", gateMode: "enabled" },
        { feature: "automation", gateMode: "enabled" },
        { feature: "ai_insights", gateMode: "enabled" },
        { feature: "custom_css", gateMode: "enabled" },
        { feature: "responsive_overrides", gateMode: "enabled" },
        { feature: "templates", gateMode: "enabled" },
        { feature: "export_data", gateMode: "enabled" },
        { feature: "remove_branding", gateMode: "enabled" },
        { feature: "duplicate_bundle", gateMode: "enabled" },
        { feature: "bundle_behavior", gateMode: "enabled" },
        { feature: "advanced_discount_controls", gateMode: "enabled" },
        { feature: "advanced_cart_controls", gateMode: "enabled" },
        { feature: "auto_translate", gateMode: "enabled" },
    ],
};

export const PLAN_CONFIGS: Record<PlanId, PlanConfig> = {
    FREE: DEV_UNLOCK_ALL ? unlockAll(FREE_CONFIG) : FREE_CONFIG,
    PRO: PRO_CONFIG,
};
