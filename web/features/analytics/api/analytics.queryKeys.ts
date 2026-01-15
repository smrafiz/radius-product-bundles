/**
 * Analytics Query Keys
 */

export const analyticsQueryKeys = {
    all: ["analytics"] as const,
    metrics: (days?: number, startDate?: string, endDate?: string) =>
        [
            ...analyticsQueryKeys.all,
            "metrics",
            days,
            startDate,
            endDate,
        ] as const,
    chart: (days?: number, startDate?: string, endDate?: string) =>
        [...analyticsQueryKeys.all, "chart", days, startDate, endDate] as const,
    bundles: {
        all: () => [...analyticsQueryKeys.all, "bundles"] as const,

        top: (startDate?: string, endDate?: string, limit?: number) =>
            [
                ...analyticsQueryKeys.all,
                "bundles",
                "top",
                startDate,
                endDate,
                limit,
            ] as const,
    },
};
