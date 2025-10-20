/**
 * Bundle Fragments.
 */

export const bundleFragments = {
    // Common reusable includes
    common: {
        products: {
            orderBy: { displayOrder: "asc" } as const,
        },
        withProducts: {
            bundleProducts: {
                orderBy: { displayOrder: "asc" } as const,
            },
        },
        withSettings: {
            settings: true,
            bundleProducts: {
                orderBy: { displayOrder: "asc" } as const,
            },
        },
        withAnalytics: {
            _count: {
                select: {
                    analytics: true,
                },
            },
        },
    },

    // Basic bundle fields
    basic: {
        id: true,
        name: true,
        type: true,
        status: true,
        createdAt: true,
        updatedAt: true,
    },

    // Bundle with products
    withProducts: {
        include: {
            bundleProducts: {
                orderBy: { displayOrder: "asc" } as const,
            },
        },
    },

    // Bundle with full details
    withDetails: {
        include: {
            bundleProducts: {
                orderBy: { displayOrder: "asc" } as const,
            },
            productGroups: {
                include: {
                    products: true,
                },
            },
            settings: true,
        },
    },

    // Bundle for dashboard/listing
    forDashboard: {
        include: {
            bundleProducts: {
                orderBy: { displayOrder: "asc" } as const,
            },
            _count: {
                select: {
                    analytics: true,
                },
            },
        },
        orderBy: { updatedAt: "desc" } as const,
    },

    // Date range helpers
    dates: {
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
    },
} as const;
