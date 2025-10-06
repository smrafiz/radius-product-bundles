export const commonIncludes = {
    bundleProducts: {
        orderBy: { displayOrder: "asc" } as const,
    },

    bundleWithProducts: {
        bundleProducts: {
            orderBy: { displayOrder: "asc" } as const,
        },
    },

    bundleWithSettings: {
        settings: true,
        bundleProducts: {
            orderBy: { displayOrder: "asc" } as const,
        },
    },

    bundleWithAnalytics: {
        _count: {
            select: {
                analytics: true,
            },
        },
    },
} as const;

export const dateRanges = {
    thirtyDaysAgo: () => {
        const date = new Date();
        date.setDate(date.getDate() - 30);
        return date;
    },

    sixtyDaysAgo: () => {
        const date = new Date();
        date.setDate(date.getDate() - 60);
        return date;
    },

    recentMinutes: (minutes: number) => {
        return new Date(Date.now() - minutes * 60 * 1000);
    },
} as const;
