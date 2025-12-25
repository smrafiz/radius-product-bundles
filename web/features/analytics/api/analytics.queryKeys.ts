/**
 * Analytics Query Keys
 */

export const analyticsQueryKeys = {
    all: ["analytics"] as const,
    metrics: (days?: number) =>
        [...analyticsQueryKeys.all, "metrics", days] as const,
    bundles: (days?: number) =>
        [...analyticsQueryKeys.all, "bundles", days] as const,
    chart: (days?: number) =>
        [...analyticsQueryKeys.all, "chart", days] as const,
};
