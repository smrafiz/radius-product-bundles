import {
    AnalyticsMetricConfig,
    AnalyticsBasedBundleConfig,
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
 * Analytics based bundle
 */
export const ANALYTICS_BASED_BUNDLE: AnalyticsBasedBundleConfig[] = [
    {
        name: "John Doe",
        views: 0,
        sales_value: "$0",
        sales_number: 2,
        status: "active",
        tone: "success",
    },
    {
        name: "Jane Smith",
        views: 0,
        sales_value: "$0",
        sales_number: 2,
        status: "active",
        tone: "success",
    },
    {
        name: "Brandon Johnson",
        views: 0,
        sales_value: "$0",
        sales_number: 2,
        status: "Draft",
        tone: "neutral",
    },
    {
        name: "Sarah Wilson",
        views: 0,
        sales_value: "$0",
        sales_number: 2,
        status: "active",
        tone: "success",
    },
    {
        name: "Michael Brown",
        views: 0,
        sales_value: "$0",
        sales_number: 2,
        status: "active",
        tone: "success",
    },
    {
        name: "Emily Davis",
        views: 0,
        sales_value: "$0",
        sales_number: 2,
        status: "active",
        tone: "success",
    },
    {
        name: "David Miller",
        views: 0,
        sales_value: "$0",
        sales_number: 2,
        status: "active",
        tone: "success",
    },
    {
        name: "Lisa Garcia",
        views: 0,
        sales_value: "$0",
        sales_number: 2,
        status: "active",
        tone: "success",
    },
    {
        name: "Robert Martinez",
        views: 0,
        sales_value: "$0",
        sales_number: 2,
        status: "active",
        tone: "success",
    },
    {
        name: "Jennifer Anderson",
        views: 0,
        sales_value: "$0",
        sales_number: 2,
        status: "active",
        tone: "success",
    },
    {
        name: "James Taylor",
        views: 0,
        sales_value: "$0",
        sales_number: 2,
        status: "active",
        tone: "success",
    },
    {
        name: "Stephanie Hall",
        views: 0,
        sales_value: "$0",
        sales_number: 2,
        status: "active",
        tone: "success",
    },
    {
        name: "Mark Allen",
        views: 0,
        sales_value: "$0",
        sales_number: 2,
        status: "active",
        tone: "success",
    },
    {
        name: "Michelle Young",
        views: 0,
        sales_value: "$0",
        sales_number: 2,
        status: "active",
        tone: "success",
    },
    {
        name: "Steven King",
        views: 0,
        sales_value: "$0",
        sales_number: 2,
        status: "active",
        tone: "success",
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
