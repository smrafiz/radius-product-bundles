/**
 * Analytics Query Keys
 */

export const analyticsQueryKeys = {
    all: ["analytics"] as const,
    metrics: (days?: number, startDate?: string, endDate?: string) =>
        [...analyticsQueryKeys.all, "metrics", days, startDate, endDate] as const,
    bundles: (days?: number) =>
        [...analyticsQueryKeys.all, "bundles", days] as const,
    chart: (days?: number, startDate?: string, endDate?: string) =>
        [...analyticsQueryKeys.all, "chart", days, startDate, endDate] as const,
};
