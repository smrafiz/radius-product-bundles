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
                { labelKey: "bundleLayouts", free: "layoutsFree", pro: "layoutsPro" },
                { labelKey: "scheduledPaused", free: false, pro: true },
            ],
        },
        {
            categoryKey: "analytics",
            rows: [
                { labelKey: "analytics", free: "basic", pro: "full" },
                { labelKey: "customerJourneyFunnel", free: false, pro: isFeatureEnabled("PRO", "analytics_full") },
                { labelKey: "conversionPerformance", free: false, pro: isFeatureEnabled("PRO", "analytics_full") },
                { labelKey: "revenueAnalysis", free: false, pro: isFeatureEnabled("PRO", "analytics_full") },
                { labelKey: "allBundlesPerformance", free: false, pro: isFeatureEnabled("PRO", "analytics_full") },
                { labelKey: "exportData", free: false, pro: "coming-soon" },
            ],
        },
        {
            categoryKey: "advanced",
            rows: [
                { labelKey: "abTesting", free: false, pro: "coming-soon" },
                { labelKey: "automation", free: false, pro: "coming-soon" },
                { labelKey: "aiInsights", free: false, pro: "coming-soon" },
                { labelKey: "customCss", free: isFeatureEnabled("FREE", "custom_css"), pro: isFeatureEnabled("PRO", "custom_css") },
                { labelKey: "responsiveOverrides", free: isFeatureEnabled("FREE", "responsive_overrides"), pro: isFeatureEnabled("PRO", "responsive_overrides") },
                { labelKey: "bundleBehavior", free: isFeatureEnabled("FREE", "bundle_behavior"), pro: isFeatureEnabled("PRO", "bundle_behavior") },
                { labelKey: "advancedDiscountControls", free: isFeatureEnabled("FREE", "advanced_discount_controls"), pro: isFeatureEnabled("PRO", "advanced_discount_controls") },
                { labelKey: "maxBundlesPerOrder", free: isFeatureEnabled("FREE", "advanced_cart_controls"), pro: isFeatureEnabled("PRO", "advanced_cart_controls") },
                { labelKey: "bundlePriorityStrategy", free: isFeatureEnabled("FREE", "advanced_cart_controls"), pro: isFeatureEnabled("PRO", "advanced_cart_controls") },
                { labelKey: "hidePaymentButtons", free: isFeatureEnabled("FREE", "advanced_cart_controls"), pro: isFeatureEnabled("PRO", "advanced_cart_controls") },
                { labelKey: "savingsBanner", free: isFeatureEnabled("FREE", "advanced_cart_controls"), pro: isFeatureEnabled("PRO", "advanced_cart_controls") },
                { labelKey: "discountStacking", free: isFeatureEnabled("FREE", "advanced_cart_controls"), pro: isFeatureEnabled("PRO", "advanced_cart_controls") },
                { labelKey: "duplicateBundle", free: isFeatureEnabled("FREE", "duplicate_bundle"), pro: isFeatureEnabled("PRO", "duplicate_bundle") },
                { labelKey: "autoTranslate", free: isFeatureEnabled("FREE", "auto_translate"), pro: isFeatureEnabled("PRO", "auto_translate") },
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
