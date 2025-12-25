"use client";

import {
    ANALYTICS_METRICS,
    AnalyticsMetricCard,
    AnalyticsMetricsData,
    useAnalyticsMetrics,
} from "@/features/analytics";
import { useMemo } from "react";
import { formatByType } from "@/features/dashboard";

export function AnalyticsMetrics() {
    const { metrics, isFetching } = useAnalyticsMetrics(30);

    const cards = useMemo(() => {
        const metricsData: Partial<AnalyticsMetricsData> = {
            totalRevenue: metrics?.totals?.revenue ?? 0,
            revenueGrowth: metrics?.growth?.revenue ?? 0,
            conversionGrowth: metrics?.growth?.conversion ?? 0,
            avgConversionRate: metrics?.metrics?.conversionRate ?? 0,
        };

        return ANALYTICS_METRICS.map((cfg) => ({
            title: cfg.title,
            icon: cfg.icon,
            tone: cfg.tone,
            value: formatByType(metricsData?.[cfg.key] ?? 0, cfg.format),
        }));
    }, [metrics]);

    return (
        <s-grid
            gridTemplateColumns="repeat(auto-fit, minmax(180px, 1fr))"
            gap="base"
        >
            {cards.map((_card, index) => (
                <s-grid-item key={_card.title} gridColumn="auto">
                    <AnalyticsMetricCard
                        key={_card.title}
                        loading={isFetching}
                        {..._card}
                    />
                </s-grid-item>
            ))}
        </s-grid>
    );
}
