"use client";

import {
    ANALYTICS_METRICS,
    AnalyticsMetricsData,
    useAnalyticsMetrics,
} from "@/features/analytics";
import { useMemo } from "react";
import { formatByType, MetricCard } from "@/shared";
import { useTranslations } from "@/lib/i18n/provider";

export function AnalyticsMetrics() {
    const { metrics, isFetching } = useAnalyticsMetrics();
    const t = useTranslations("Analytics.Metrics");

    const cards = useMemo(() => {
        const metricsData: Partial<AnalyticsMetricsData> = {
            totalRevenue: metrics?.totals?.revenue ?? 0,
            revenueGrowth: metrics?.growth?.revenue ?? 0,
            conversionGrowth: metrics?.growth?.conversion ?? 0,
            avgConversionRate: metrics?.metrics?.conversionRate ?? 0,
        };

        // Growth data mapping
        const growthData: Record<string, number | undefined> = {
            totalRevenue: metrics?.growth?.revenue,
            revenueGrowth: undefined,
            conversionGrowth: undefined,
            avgConversionRate: metrics?.growth?.conversion,
        };

        return ANALYTICS_METRICS.map((cfg) => ({
            title: t(cfg.key, undefined, cfg.title),
            icon: cfg.icon,
            tone: cfg.tone,
            img: cfg.img,
            value: formatByType(metricsData?.[cfg.key] ?? 0, cfg.format),
            growth: growthData[cfg.key],
        }));
    }, [metrics, t]);

    return (
        <s-grid
            gridTemplateColumns="repeat(auto-fit, minmax(180px, 1fr))"
            gap="base"
        >
            {cards.map((_card) => (
                <s-grid-item key={_card.title} gridColumn="auto">
                    <MetricCard
                        key={_card.title}
                        loading={isFetching}
                        {..._card}
                    />
                </s-grid-item>
            ))}
        </s-grid>
    );
}
