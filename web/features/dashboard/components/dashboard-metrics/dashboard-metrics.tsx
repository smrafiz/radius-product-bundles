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
                value: formatByType(metrics?.[cfg.key], cfg.format),
            })),
        [metrics],
    );

    return (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {cards.map((card) => (
                <MetricCard
                    key={card.title}
                    loading={isMetricsFetching}
                    {...card}
                />
            ))}
        </div>
    );
}
