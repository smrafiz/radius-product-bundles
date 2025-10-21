/**
 * Bundle Prisma Fragments
 *
 * Reusable query parts for Prisma queries.
 */

import { Prisma } from "@prisma/client";

// ==========================================
// SELECT Fragments (Field Selection)
// ==========================================

export const BUNDLE_BASIC_SELECT = {
    id: true,
    name: true,
    type: true,
    status: true,
    createdAt: true,
    updatedAt: true,
} satisfies Prisma.BundleSelect;

export const BUNDLE_WITH_METRICS_SELECT = {
    ...BUNDLE_BASIC_SELECT,
    views: true,
    conversions: true,
    revenue: true,
} satisfies Prisma.BundleSelect;

// ==========================================
// INCLUDE Fragments (Relations)
// ==========================================

export const INCLUDE_BUNDLE_PRODUCTS = {
    bundleProducts: {
        orderBy: { displayOrder: "asc" } as const,
    },
} satisfies Prisma.BundleInclude;

export const INCLUDE_PRODUCT_GROUPS = {
    productGroups: {
        include: {
            products: true,
        },
    },
} satisfies Prisma.BundleInclude;

export const INCLUDE_SETTINGS = {
    settings: true,
} satisfies Prisma.BundleInclude;

export const INCLUDE_ANALYTICS_COUNT = {
    _count: {
        select: {
            analytics: true,
        },
    },
} satisfies Prisma.BundleInclude;

// ==========================================
// COMPOSITE Includes
// ==========================================

export const INCLUDE_BUNDLE_DETAILS = {
    ...INCLUDE_BUNDLE_PRODUCTS,
    ...INCLUDE_SETTINGS,
} satisfies Prisma.BundleInclude;

export const INCLUDE_BUNDLE_FULL = {
    ...INCLUDE_BUNDLE_PRODUCTS,
    ...INCLUDE_PRODUCT_GROUPS,
    ...INCLUDE_SETTINGS,
} satisfies Prisma.BundleInclude;

export const INCLUDE_BUNDLE_DASHBOARD = {
    ...INCLUDE_BUNDLE_PRODUCTS,
    ...INCLUDE_ANALYTICS_COUNT,
} satisfies Prisma.BundleInclude;

// ==========================================
// ORDER BY Fragments
// ==========================================

export const ORDER_BY_RECENT = {
    updatedAt: "desc",
} as const satisfies Prisma.BundleOrderByWithRelationInput;

export const ORDER_BY_NEWEST = {
    createdAt: "desc",
} as const satisfies Prisma.BundleOrderByWithRelationInput;

export const ORDER_BY_NAME = {
    name: "asc",
} as const satisfies Prisma.BundleOrderByWithRelationInput;