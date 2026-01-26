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
        img: {
            url: "/assets/active-bundles.svg",
            alt: "Enable app embed",
        },
    },
    {
        title: "Total Bundles",
        value: (metrics?.totalBundles ?? "").toString(),
        comparisonLabel: "Total created",
        img: {
            url: "/assets/total-bundles.svg",
            alt: "Enable app embed",
        },
    },
    {
        title: "Total Views",
        value:
            metrics?.totalViews !== undefined
                ? metrics.totalViews.toLocaleString()
                : "",
        tone: "info",
        icon: "arrow-down",
        img: {
            url: "/assets/total-views.svg",
            alt: "Enable app embed",
        },
    },
    {
        title: "Total Revenue",
        value:
            metrics?.revenueAllTime !== undefined
                ? formatCurrency(metrics.revenueAllTime)
                : "",
        tone: "info",
        icon: "arrow-down",
        img: {
            url: "/assets/total-revenue.svg",
            alt: "Enable app embed",
        },
    },
];
