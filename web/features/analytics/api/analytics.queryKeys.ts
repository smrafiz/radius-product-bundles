/**
 * Analytics Query Keys
 */

export const analyticsQueryKeys = {
    all: ["analytics"] as const,

    /**
     * Metrics query keys
     */
    metrics: (days?: number, startDate?: string, endDate?: string) =>
        [
            ...analyticsQueryKeys.all,
            "metrics",
            days,
            startDate,
            endDate,
        ] as const,

    /**
     * Chart data query keys
     */
    chart: (days?: number, startDate?: string, endDate?: string) =>
        [...analyticsQueryKeys.all, "chart", days, startDate, endDate] as const,

    /**
     * Bundle-related query keys
     */
    bundles: {
        all: () => [...analyticsQueryKeys.all, "bundles"] as const,

        /**
         * Top bundles query key
         */
        top: (startDate?: string, endDate?: string, limit?: number) =>
            [
                ...analyticsQueryKeys.all,
                "bundles",
                "top",
                startDate,
                endDate,
                limit,
            ] as const,

        /**
         * All bundles (non-paginated) query key
         */
        list: (
            startDate?: string,
            endDate?: string,
            sortBy?: string,
            sortOrder?: string,
        ) =>
            [
                ...analyticsQueryKeys.all,
                "bundles",
                "list",
                startDate,
                endDate,
                sortBy,
                sortOrder,
            ] as const,

        /**
         * Paginated bundles query key
         */
        paginated: (
            startDate?: string,
            endDate?: string,
            sortBy?: string,
            sortOrder?: string,
            page?: number,
            perPage?: number,
            search?: string,
        ) =>
            [
                ...analyticsQueryKeys.all,
                "bundles",
                "paginated",
                startDate,
                endDate,
                sortBy,
                sortOrder,
                page,
                perPage,
                search,
            ] as const,
    },
};
