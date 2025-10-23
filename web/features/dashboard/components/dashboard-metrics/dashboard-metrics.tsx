"use client";

import { useMemo } from "react";
import { MetricCard } from "@/shared/components";
import {
    DASHBOARD_METRICS,
    formatByType,
    useDashboardData,
} from "@/features/dashboard";

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
                tone: cfg.tone,
                value: formatByType(metrics?.[cfg.key], cfg.format),
            })),
        [metrics],
    );

    return (
        <>
        {/*<div className="grid grid-cols-1 md:grid-cols-4 gap-4">*/}
        {/*    {cards.map((card) => (*/}
        {/*        <MetricCard*/}
        {/*            key={card.title}*/}
        {/*            loading={isMetricsFetching}*/}
        {/*            {...card}*/}
        {/*        />*/}
        {/*    ))}*/}
        {/*</div>*/}


        <s-grid
            gridTemplateColumns="repeat(auto-fit, minmax(180px, 1fr))"
            gap="small"
        >
            {cards.map((card, index) => (
                <s-grid-item
                    key={card.title}
                    gridColumn="auto"
                >
                    <s-section>
                        <s-heading>{card.title}</s-heading>
                        <s-stack direction="inline" gap="small-200">
                            <s-text>{card.value}</s-text>
                            <s-badge tone={card.tone} icon={card.icon}>12%</s-badge>
                        </s-stack>
                    </s-section>
                </s-grid-item>
            ))}
        </s-grid>
        </>
    );
}
