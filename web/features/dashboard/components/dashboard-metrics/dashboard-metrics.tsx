"use client";

import { useMemo } from "react";
import { MetricCard } from "@/shared/components";
import { useAnalyticsMetrics } from "@/features/analytics";
import { DASHBOARD_METRICS, formatByType } from "@/features/dashboard";

/**
 * Dashboard Metrics Component
 */
export function DashboardMetrics() {
    const { metrics, isFetching } = useAnalyticsMetrics(9999);

    const cards = useMemo(() => {
        const metricsData: Record<string, number> = {
            activeBundles: metrics?.totals?.activeBundles ?? 0,
            totalRevenue: metrics?.totals?.revenueAllTime ?? 0,
            avgConversionRate: metrics?.metrics?.conversionRate ?? 0,
            totalViews: metrics?.totals?.views ?? 0,
        };

        const growthData: Record<string, number | undefined> = {
            totalRevenue: metrics?.growth?.revenue,
            avgConversionRate: metrics?.growth?.conversion,
        };

        return DASHBOARD_METRICS.map((cfg) => ({
            title: cfg.title,
            icon: cfg.icon,
            tone: cfg.tone,
            img: cfg.img,
            value: formatByType(metricsData[cfg.key], cfg.format),
            growth: growthData[cfg.key],
            action: cfg.action,
        }));
    }, [metrics]);

    return (
        <s-grid
            gridTemplateColumns="repeat(auto-fit, minmax(180px, 1fr))"
            gap="small"
        >
            {cards.map((card) => (
                <s-grid-item key={card.title} gridColumn="auto">
                    <MetricCard loading={isFetching} {...card} />
                </s-grid-item>
            ))}
        </s-grid>
    );
}
