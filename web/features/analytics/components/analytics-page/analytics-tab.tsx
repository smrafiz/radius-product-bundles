"use client";

import {
    AllBundlesTable,
    AnalyticsBasedBundles,
    AnalyticsDate,
    AnalyticsMetrics,
} from "@/features/analytics";
import { useState } from "react";
import { useTranslations } from "@/lib/i18n/provider";
import dynamic from "next/dynamic";
import { useSearchParams } from "next/navigation";

const AnalyticsChart = dynamic(
    () =>
        import("../analytics-charts/analytics-chart").then((m) => ({
            default: m.AnalyticsChart,
        })),
    { ssr: false },
);

const AnalyticsComparisonCharts = dynamic(
    () =>
        import("../analytics-charts/analytics-comparison-charts").then((m) => ({
            default: m.AnalyticsComparisonCharts,
        })),
    { ssr: false },
);

const TAB_KEYS = ["overview", "bundle-performance"] as const;
type TabKey = (typeof TAB_KEYS)[number];

export function AnalyticsTabs() {
    const t = useTranslations("Analytics.Tabs");
    const searchParams = useSearchParams();
    const tabParam = searchParams.get("tab") as TabKey | null;
    const initialTab =
        tabParam && TAB_KEYS.includes(tabParam)
            ? tabParam
            : "overview";
    const [activeTab, setActiveTab] = useState<TabKey>(initialTab);

    const TABS = [
        { key: "overview" as const, label: t("overview"), icon: "chart-vertical" as const },
        { key: "bundle-performance" as const, label: t("bundlePerformance"), icon: "package" as const },
    ];

    return (
        <s-stack gap="base">
            <s-stack
                direction="inline"
                alignItems="center"
                gap="small-300"
                justifyContent="space-between"
                borderRadius="base"
                padding="small-400"
                background="base"
            >
                <s-stack
                    direction="inline"
                    gap="small-300"
                    borderRadius="base"
                    padding="small-200"
                    background="base"
                >
                    {TABS.map((tab) => (
                        <s-button
                            key={tab.key}
                            variant={
                                activeTab === tab.key ? "secondary" : "tertiary"
                            }
                            icon={tab.icon}
                            onClick={() => setActiveTab(tab.key)}
                        >
                            {tab.label}
                        </s-button>
                    ))}
                </s-stack>

                <s-stack
                    direction="inline"
                    gap="none"
                    borderRadius="base"
                    padding="small-200"
                    background="base"
                >
                    <AnalyticsDate />
                </s-stack>
            </s-stack>

            <AnalyticsMetrics />

            <div
                key={activeTab}
                style={{ animation: "rpbFadeIn 0.15s ease-out" }}
            >
                {activeTab === "overview" ? (
                    <s-stack gap="base">
                        <AnalyticsChart />
                        <AnalyticsComparisonCharts />
                    </s-stack>
                ) : (
                    <s-stack gap="base">
                        <AnalyticsBasedBundles />
                        <AllBundlesTable />
                    </s-stack>
                )}
            </div>

        </s-stack>
    );
}
