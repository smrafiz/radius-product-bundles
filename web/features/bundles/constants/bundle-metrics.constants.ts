/*
 * Bundle metrics constants
 */

import { formatCurrency, MetricCardProps } from "@/shared";

/**
 * Bundle listing metrics
 */
export const BUNDLE_LISTING_METRICS = (metrics: any): MetricCardProps[] => [
    {
        title: "Active Bundles",
        value: (metrics?.activeBundles ?? "").toString(),
        comparisonLabel: "Total created",
        svg_icon: "analytics-graph",
    },
    {
        title: "Total Bundles",
        value: (metrics?.totalBundles ?? "").toString(),
        comparisonLabel: "Total created",
        svg_icon: "analytics-funnel",
    },
    {
        title: "Total Views",
        value:
            metrics?.totalViews !== undefined
                ? metrics.totalViews.toLocaleString()
                : "",
        tone: "info",
        icon: "arrow-down",
        svg_icon: "analytics-svg-repo",
    },
    {
        title: "Total Revenue",
        value:
            metrics?.revenueAllTime !== undefined
                ? formatCurrency(metrics.revenueAllTime)
                : "",
        tone: "info",
        icon: "arrow-down",
        svg_icon: "analytics-svg-repo",
    },
];
