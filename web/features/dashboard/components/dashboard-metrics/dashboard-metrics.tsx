"use client";

import {
    DASHBOARD_METRICS,
    formatByType,
    useDashboardData,
} from "@/features/dashboard";
import { useMemo } from "react";
import { MetricCard } from "@/shared/components";

/**
 * Dashboard Metrics Component
 */
export function DashboardMetrics() {
    const { metrics, isMetricsFetching } = useDashboardData();

    const cards = useMemo(
        () =>
            DASHBOARD_METRICS.map((cfg) => ({
                title: cfg.title,
                icon: cfg.icon,
                svg_icon: cfg.svg_icon,
                tone: cfg.tone,
                value: formatByType(metrics?.[cfg.key], cfg.format),
            })),
        [metrics],
    );

    return (
        <s-grid
            gridTemplateColumns="repeat(auto-fit, minmax(180px, 1fr))"
            gap="small"
        >
            {cards.map((card) => (
                <s-grid-item key={card.title} gridColumn="auto">
                    <MetricCard
                        key={card.title}
                        loading={isMetricsFetching}
                        {...card}
                    />
                </s-grid-item>
            ))}
        </s-grid>
    );
}
