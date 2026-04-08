import type { PlanConfig, PlanId, PlanLimits } from "@/shared";
import type { PlanName } from "@/prisma/generated/enums";

export const DEFAULT_PLAN_ID: PlanName = "FREE";

// Only active outside of production — prevents accidental unlock in live stores
const DEV_UNLOCK_ALL = process.env.NEXT_PUBLIC_UNLOCK_ALL_FEATURES === "true";

const FREE_CONFIG: PlanConfig = {
    id: "FREE" as PlanName,
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
        { feature: "volume_discount", gateMode: "redirect" },
    ],
};

function unlockAll(config: PlanConfig, overrides?: {
    id?: PlanId;
    name?: string;
    extraLimits?: Partial<PlanLimits>;
}): PlanConfig {
    return {
        ...config,
        id: overrides?.id ?? config.id,
        name: overrides?.name ?? `${config.name} (Dev Unlocked)`,
        limits: {
            ...config.limits,
            maxBundles: -1,
            maxProductsPerBundle: -1,
            allowedLayouts: {},
            allowedStatuses: ["DRAFT", "ACTIVE", "PAUSED", "SCHEDULED", "ARCHIVED"],
            allowedDiscountTypes: ["PERCENTAGE", "FIXED_AMOUNT", "CUSTOM_PRICE", "NO_DISCOUNT", "QUANTITY_BREAKS"],
            allowedBundleTypes: [
                "FIXED_BUNDLE", "BOGO", "BUY_X_GET_Y",
                "VOLUME_DISCOUNT", "MIX_AND_MATCH", "FREQUENTLY_BOUGHT_TOGETHER",
            ],
            ...overrides?.extraLimits,
        },
        features: config.features.map((f) => ({
            ...f,
            gateMode: "enabled" as const,
        })),
    };
}

const PRO_CONFIG: PlanConfig = unlockAll(FREE_CONFIG, {
    id: "PRO" as PlanName,
    name: "Pro",
});

export const PLAN_CONFIGS: Record<PlanName, PlanConfig> = {
    FREE: DEV_UNLOCK_ALL ? unlockAll(FREE_CONFIG) : FREE_CONFIG,
    PRO: PRO_CONFIG,
};
