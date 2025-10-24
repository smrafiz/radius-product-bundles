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
    },
    {
        title: "Total Bundles",
        value: (metrics?.totalBundles ?? "").toString(),
        comparisonLabel: "Total created",
    },
    {
        title: "Total Views",
        value:
            metrics?.totalViews !== undefined
                ? metrics.totalViews.toLocaleString()
                : "",
    },
    {
        title: "Total Revenue",
        value:
            metrics?.revenueAllTime !== undefined
                ? formatCurrency(metrics.revenueAllTime)
                : "",
    },
];
