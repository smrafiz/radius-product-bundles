"use client";

import {
    ConversionRatesChart,
    FunnelPerformanceChart,
    RevenueAOVChart,
} from "@/features/analytics";
import { ProBadge, useCrossSellStore, usePlan } from "@/shared";
import { useTranslations } from "@/lib/i18n/provider";

export function AnalyticsComparisonCharts() {
    const t = useTranslations("Analytics.Charts");
    const { canUse } = usePlan();
    const { open: openCrossSell } = useCrossSellStore();

    if (!canUse("analytics_full")) {
        return (
            <div
                className="cursor-pointer"
                onClick={() => openCrossSell("Advanced Analytics")}
            >
                <s-stack gap="base">
                    <s-grid gap="base" gridTemplateColumns="repeat(2, 1fr)">
                        <s-grid-item>
                            <s-section>
                                <LockedChartPlaceholder title={t("funnelTitle")} />
                            </s-section>
                        </s-grid-item>
                        <s-grid-item>
                            <s-section>
                                <LockedChartPlaceholder title={t("conversionTitle")} />
                            </s-section>
                        </s-grid-item>
                    </s-grid>
                    <s-section>
                        <LockedChartPlaceholder title={t("revenueTitle")} />
                    </s-section>
                </s-stack>
            </div>
        );
    }

    return (
        <s-stack gap="base">
            <s-grid gap="base" gridTemplateColumns="repeat(2, 1fr)">
                <s-grid-item>
                    <FunnelPerformanceChart />
                </s-grid-item>
                <s-grid-item>
                    <ConversionRatesChart />
                </s-grid-item>
            </s-grid>
            <RevenueAOVChart />
        </s-stack>
    );
}

function LockedChartPlaceholder({ title }: { title: string }) {
    return (
        <div className="relative">
            <s-stack gap="base">
                <s-heading>{title}</s-heading>
                <div className="h-48 rounded-lg bg-gray-50 flex items-center justify-center">
                    <ProBadge label={title} />
                </div>
            </s-stack>
        </div>
    );
}
