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
                        <s-stack direction="inline" gap="base" alignItems={"center"}>
                            {/*<s-icon type="home" />*/}
                            <div style={{ width: 'var(--p-font-size-900)' }}>
                                <s-image
                                    src={`/assets/${card.svg_icon}.svg`}
                                    alt="Four pixelated characters ready to build amazing Shopify apps"
                                    aspectRatio="1/1"
                                    inlineSize="auto"
                                />
                            </div>

                            <s-stack gap="small-200">
                                <s-heading>{card.title}</s-heading>
                                <s-stack direction="inline" gap="small-200">
                                    <s-text><div style={{ fontSize: 'var(--p-font-size-500)' }}>{card.value}</div></s-text>
                                    <s-badge tone={card.tone} icon={card.icon}>12%</s-badge>
                                </s-stack>
                            </s-stack>
                        </s-stack>
                    </s-section>
                </s-grid-item>
            ))}
        </s-grid>
        </>
    );
}
