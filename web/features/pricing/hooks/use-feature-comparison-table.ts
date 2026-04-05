import type { TableCategory } from "@/features/pricing/types/pricing.types";
import { PLAN_CONFIGS } from "@/shared/constants/plans.constants";

function limitLabel(value: number, unlimited: string): string {
    return value === -1 ? unlimited : String(value);
}

function isFeatureEnabled(planId: "FREE" | "PRO", featureId: string): boolean {
    const cfg = PLAN_CONFIGS[planId];
    const f = cfg.features.find((feat) => feat.feature === featureId);
    return f?.gateMode === "enabled";
}

function buildTableData(unlimited: string): TableCategory[] {
    const free = PLAN_CONFIGS.FREE;
    const pro = PLAN_CONFIGS.PRO;

    return [
        {
            categoryKey: "bundles",
            rows: [
                {
                    labelKey: "maxBundles",
                    free: limitLabel(free.limits.maxBundles, unlimited),
                    pro: limitLabel(pro.limits.maxBundles, unlimited),
                },
                {
                    labelKey: "maxProducts",
                    free: limitLabel(free.limits.maxProductsPerBundle, unlimited),
                    pro: limitLabel(pro.limits.maxProductsPerBundle, unlimited),
                },
                {
                    labelKey: "bundleTypes",
                    free: String(free.limits.allowedBundleTypes.length),
                    pro: String(pro.limits.allowedBundleTypes.length),
                },
                {
                    labelKey: "discountTypes",
                    free: String(free.limits.allowedDiscountTypes.length),
                    pro: String(pro.limits.allowedDiscountTypes.length),
                },
            ],
        },
        {
            categoryKey: "analytics",
            rows: [
                {
                    labelKey: "analytics",
                    free: "basic",
                    pro: "full",
                },
                {
                    labelKey: "exportData",
                    free: isFeatureEnabled("FREE", "export_data"),
                    pro: isFeatureEnabled("PRO", "export_data"),
                },
            ],
        },
        {
            categoryKey: "advanced",
            rows: [
                { labelKey: "abTesting", free: isFeatureEnabled("FREE", "ab_testing"), pro: isFeatureEnabled("PRO", "ab_testing") },
                { labelKey: "automation", free: isFeatureEnabled("FREE", "automation"), pro: isFeatureEnabled("PRO", "automation") },
                { labelKey: "aiInsights", free: isFeatureEnabled("FREE", "ai_insights"), pro: isFeatureEnabled("PRO", "ai_insights") },
                { labelKey: "customCss", free: isFeatureEnabled("FREE", "custom_css"), pro: isFeatureEnabled("PRO", "custom_css") },
                { labelKey: "templates", free: isFeatureEnabled("FREE", "templates"), pro: isFeatureEnabled("PRO", "templates") },
                { labelKey: "removeBranding", free: isFeatureEnabled("FREE", "remove_branding"), pro: isFeatureEnabled("PRO", "remove_branding") },
                { labelKey: "responsiveOverrides", free: isFeatureEnabled("FREE", "responsive_overrides"), pro: isFeatureEnabled("PRO", "responsive_overrides") },
                { labelKey: "duplicateBundle", free: isFeatureEnabled("FREE", "duplicate_bundle"), pro: isFeatureEnabled("PRO", "duplicate_bundle") },
            ],
        },
        {
            categoryKey: "support",
            rows: [
                { labelKey: "support", free: "email", pro: "priority" },
            ],
        },
    ];
}

export function useFeatureComparisonTable(unlimited: string): { categories: TableCategory[] } {
    const categories = buildTableData(unlimited);
    return { categories };
}
