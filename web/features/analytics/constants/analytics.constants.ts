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

/*
 * Analytics order bundle
 */
export const ANALYTICS_ORDER_BUNDLE: AnalyticsOrderBundleConfig[] = [
    {
        order: 1,
        order_date: "dec-15-25",
        item: "Bundle Product",
        bundle_total: "$125",
        order_total: "$125",
    },
    {
        order: 2,
        order_date: "dec-16-25",
        item: "Bundle Product",
        bundle_total: "$125",
        order_total: "$125",
    },
    {
        order: 3,
        order_date: "dec-17-25",
        item: "Bundle Product",
        bundle_total: "$130",
        order_total: "$120",
    },
    {
        order: 4,
        order_date: "dec-18-25",
        item: "Bundle Product",
        bundle_total: "$134",
        order_total: "$156",
    },
    {
        order: 5,
        order_date: "dec-19-25",
        item: "Bundle Product",
        bundle_total: "$123",
        order_total: "$145",
    },
    {
        order: 6,
        order_date: "dec-15-25",
        item: "Bundle Product",
        bundle_total: "$225",
        order_total: "$325",
    },
    {
        order: 7,
        order_date: "dec-22-25",
        item: "Bundle Product",
        bundle_total: "$125",
        order_total: "$125",
    },
    {
        order: 8,
        order_date: "dec-24-25",
        item: "Bundle Product",
        bundle_total: "$125",
        order_total: "$125",
    },
];
