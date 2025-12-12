import { AnalyticsMetricConfig } from "@/features/analytics";

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
