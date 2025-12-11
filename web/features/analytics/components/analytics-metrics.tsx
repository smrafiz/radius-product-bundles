"use client";

import { ANALYTICS_METRICS } from "@/features/analytics";

import { formatByType, useDashboardData } from "@/features/dashboard";
import { useMemo } from "react";
import { AnalyticsMetricCard } from "./analytics-metrics-card";

export function AnalyticsMetrics() {
    const { metrics, isMetricsFetching } = useDashboardData();

    const cards = useMemo(
        () =>
            ANALYTICS_METRICS.map((cfg) => ({
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
            {cards.map((_card, index) => (
                <s-grid-item key={_card.title} gridColumn="auto">
                    <AnalyticsMetricCard
                        key={_card.title}
                        loading={isMetricsFetching}
                        {..._card}
                    />
                </s-grid-item>
            ))}
        </s-grid>
    );
}
