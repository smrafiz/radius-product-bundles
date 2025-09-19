import { MetricCardProps } from "@/types";
import { formatCurrency } from "@/utils";

export const metricsConfig = (metrics: any): MetricCardProps[] => [
    {
        title: "Active Bundles",
        value: (metrics?.activeBundles || 0).toString(),
        comparisonLabel: "Total created",
    },
    {
        title: "Total Bundles",
        value: (metrics?.totalBundles || 0).toString(),
        comparisonLabel: "Total created",
    },
    {
        title: "Total Views",
        value: (metrics?.totalViews || 0).toLocaleString(),
    },
    {
        title: "Total Revenue",
        value: formatCurrency(metrics?.revenueAllTime || 0),
    },
];