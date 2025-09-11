import { commonIncludes } from "./common.fragments";

export const bundleFragments = {
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
        include: commonIncludes.bundleWithProducts,
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
            ...commonIncludes.bundleWithProducts,
            ...commonIncludes.bundleWithAnalytics,
        },
        orderBy: { updatedAt: "desc" } as const,
    },
} as const;
