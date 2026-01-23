import {
    AnalyticsMetricConfig,
    AnalyticsOrderBundleConfig,
} from "@/features/analytics";
import { formatCurrency } from "@/shared";

/*
 * Analytics Metrics
 */
export const ANALYTICS_METRICS: AnalyticsMetricConfig[] = [
    {
        key: "totalRevenue",
        title: "Total Revenue",
        format: "currency",
        tone: "success",
    },
    {
        key: "revenueGrowth",
        title: "Revenue Growth",
        format: "percentage",
        tone: "warning",
    },
    {
        key: "conversionGrowth",
        title: "Conversion Growth",
        format: "percentage",
        tone: "info",
    },
    {
        key: "avgConversionRate",
        title: "Avg Conversion Rate",
        format: "percentage",
        tone: "info",
    },
];

/**
 * Chart metric configuration for tabs
 */
export const CHART_METRICS = [
    {
        key: "revenue",
        label: "Revenue",
        color: "#008CFF",
        description:
            "Total revenue from bundle sales including discounts, excluding shipping, taxes, and fees.",
        formula: "Revenue = Product Prices - Bundle Discounts",
        formatter: (value: number) => formatCurrency(value),
        yAxisFormatter: (value: number) => {
            if (value >= 1000) {
                return `$${Math.round(value / 100)}K`;
            }
            return `$${Math.round(value / 100)}`;
        },
    },
    {
        key: "views",
        label: "Views",
        color: "#00C896",
        description:
            "Total number of times bundles were viewed by customers. Each customer counts once per session per bundle.",
        formula: "Views = Unique bundle page visits per session",
        formatter: (value: number) => value.toLocaleString(),
        yAxisFormatter: (value: number) => {
            if (value >= 1000) {
                return `${(value / 1000).toFixed(1)}K`;
            }
            return value.toString();
        },
    },
    {
        key: "purchases",
        label: "Purchases",
        color: "#FF6B6B",
        description:
            "Total number of completed bundle purchases from all customers.",
        formula: "Purchases = Orders containing bundle products",
        formatter: (value: number) => value.toLocaleString(),
        yAxisFormatter: (value: number) => value.toString(),
    },
] as const;
