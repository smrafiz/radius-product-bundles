import {
    AnalyticsMetricConfig,
    AnalyticsOrderBundleConfig,
} from "@/features/analytics";

/*
 * Analytics Metrics
 */
export const ANALYTICS_METRICS: AnalyticsMetricConfig[] = [
    {
        key: "totalRevenue",
        title: "Total Revenue",
        format: "currency",
        tone: "success",
        icon: "arrow-up",
    },
    {
        key: "revenueGrowth",
        title: "Revenue Growth",
        format: "percentage",
        tone: "warning",
        icon: "arrow-up",
    },
    {
        key: "conversionGrowth",
        title: "Conversion Growth",
        format: "number",
        tone: "info",
        icon: "arrow-down",
    },
    {
        key: "avgConversionRate",
        title: "Avg Conversion Rate",
        format: "number",
        tone: "info",
        icon: "arrow-down",
    },
];

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
