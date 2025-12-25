"use client";

import { useMemo } from "react";
import { MetricCard } from "@/shared/components";
import { useAnalyticsMetrics } from "@/features/analytics";
import { DASHBOARD_METRICS, formatByType } from "@/features/dashboard";

/**
 * Dashboard Metrics Component
 */
export function DashboardMetrics() {
    const { metrics, isFetching } = useAnalyticsMetrics(30);

    const cards = useMemo(() => {
        const metricsData: Record<string, number> = {
            totalRevenue: metrics?.totals?.revenueAllTime ?? 0,
            avgConversionRate: metrics?.metrics?.conversionRate ?? 0,
            totalViews: metrics?.totals?.views ?? 0,
        };

        return DASHBOARD_METRICS.map((cfg) => ({
            title: cfg.title,
            icon: cfg.icon,
            tone: cfg.tone,
            value: formatByType(metricsData[cfg.key], cfg.format),
        }));
    }, [metrics]);

    return (
        <s-grid
            gridTemplateColumns="repeat(auto-fit, minmax(180px, 1fr))"
            gap="small"
        >
            {cards.map((card) => (
                <s-grid-item key={card.title} gridColumn="auto">
                    <MetricCard
                        key={card.title}
                        loading={isFetching}
                        {...card}
                    />
                </s-grid-item>
            ))}
        </s-grid>
    );
}
