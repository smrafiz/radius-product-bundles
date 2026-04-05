"use client";

import React, { Fragment } from "react";
import { useTranslations } from "@/lib/i18n/provider";
import { CellValue } from "@/features/pricing";
import { useFeatureComparisonTable } from "@/features/pricing/hooks/use-feature-comparison-table";

const VALUE_KEYS = ["basic", "full", "email", "priority"];

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
    const { categories } = useFeatureComparisonTable(unlimited);

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
