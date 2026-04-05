"use client";

import React, { Fragment } from "react";
import { useTranslations } from "@/lib/i18n/provider";
import { CellValue, TableCategory } from "@/features/pricing";
import { PLAN_CONFIGS } from "@/shared/constants/plans.constants";

const VALUE_KEYS = ["basic", "full", "email", "priority"];

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

type TranslateFn = ReturnType<typeof useTranslations>;

function Cell({ value, t }: { value: CellValue; t: TranslateFn }) {
    if (typeof value === "boolean") {
        if (value) {
            return (
                <span className="flex justify-center">
                    <s-icon type="check-circle" tone="success" size="small" />
                </span>
            );
        }
        return <span className="text-gray-300 block text-center">—</span>;
    }
    const isValueKey = VALUE_KEYS.includes(value);
    const translated = isValueKey ? t(`values.${value}` as never) : value;
    return <span>{translated as string}</span>;
}

export function FeatureComparisonTable() {
    const t = useTranslations("Pricing.ComparisonTable");
    const unlimited = t("unlimited");
    const categories = buildTableData(unlimited);

    return (
        <s-section>
            <s-stack direction="block" gap="base">
                <s-stack direction="block" gap="small-200">
                    <div className="text-base font-semibold">{t("title")}</div>
                    <s-text color="subdued">{t("subtitle")}</s-text>
                </s-stack>

                <div className="overflow-x-auto rounded-lg border border-gray-200">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-gray-200">
                                <th className="py-3 px-4 text-left font-medium text-gray-700 w-1/2">
                                    {t("featureCol")}
                                </th>
                                <th className="py-3 px-4 text-center font-medium text-gray-700 w-1/4">
                                    Free
                                </th>
                                <th className="py-3 px-4 text-center font-semibold text-green-700 bg-green-50 w-1/4">
                                    <span className="flex items-center justify-center gap-1">
                                        Pro
                                        <s-badge tone="success">{t("mostPopular")}</s-badge>
                                    </span>
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {categories.map((cat) => (
                                <Fragment key={cat.categoryKey}>
                                    <tr className="bg-gray-50 border-b border-gray-100">
                                        <td
                                            colSpan={3}
                                            className="py-2 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide"
                                        >
                                            {t(`categories.${cat.categoryKey}` as never)}
                                        </td>
                                    </tr>
                                    {cat.rows.map((row) => (
                                        <tr
                                            key={row.labelKey}
                                            className="border-b border-gray-100 last:border-0 hover:bg-gray-50/50 transition-colors"
                                        >
                                            <td className="py-3 px-4 text-gray-700">
                                                {t(`features.${row.labelKey}` as never)}
                                            </td>
                                            <td className="py-3 px-4 text-center text-gray-600">
                                                <Cell value={row.free} t={t} />
                                            </td>
                                            <td className="py-3 px-4 text-center text-green-700 font-medium bg-green-50/50">
                                                <Cell value={row.pro} t={t} />
                                            </td>
                                        </tr>
                                    ))}
                                </Fragment>
                            ))}
                        </tbody>
                    </table>
                </div>
            </s-stack>
        </s-section>
    );
}
