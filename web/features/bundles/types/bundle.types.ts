/*
 * All Bundle types
 */

import type {
    Bundle as PrismaBundle,
    BundleStatus as PrismaBundleStatus,
    BundleType as PrismaBundleType,
    DiscountType as PrismaDiscountType,
} from "@prisma/client";
import { IconSource } from "@shopify/polaris";
import { Tone } from "@shopify/polaris/build/ts/src/components/Badge";

// Re-export Prisma enums
export type BundleStatus = PrismaBundleStatus;
export type BundleType = PrismaBundleType;
export type DiscountType = PrismaDiscountType;

/*
 * Bundle types
 */
export interface Bundle {
    id: string;
    name: string;
    type: PrismaBundleType;
    status: PrismaBundleStatus;
    views: number;
    conversions: number;
    revenue: number;
    conversionRate: number;
    productCount: number;
    createdAt: string;
}

/**
 * Bundle for list display
 */
export interface BundleListItem {
    id: string;
    name: string;
    type: BundleType;
    status: BundleStatus;
    views: number;
    conversions: number;
    revenue: number;
    revenueAllTime: number;
    conversionRate: number;
    productCount: number;
    createdAt: string;

    discountType: DiscountType;
    discountValue: number;

    products: Array<{
        id: string;
        title: string;
        featuredImage?: string;
        handle: string;
    }>;
}

/**
 * Full bundle with all details
 */
export interface BundleWithDetails extends PrismaBundle {
    conversionRate: number;
    productCount: number;
}

/**
 * Bundle creation/update payload
 */
export interface BundleFormData {
    name: string;
    description?: string;
    type: BundleType;
    discountType: DiscountType;
    discountValue: number;
    minOrderValue?: number;
    maxDiscountAmount?: number;
    products: Array<{
        productId: string;
        variantId?: string;
        quantity: number;
    }>;
    startDate?: Date;
    endDate?: Date;
}

/**
 * Bundle product
 */
export interface BundleProduct {
    productId: string;
    variantId?: string;
    quantity: number;
    role: "INCLUDED" | "OPTIONAL";
}

/**
 * Product selection item
 */
export interface SelectedItem {
    id: string;
    productId: string;
    variantId?: string;
    title: string;
    type: "product" | "variant";
    quantity: number;
    totalVariants?: number;
}

/**
 * Product group
 */
export interface ProductGroup {
    id: string;
    title: string;
    product: SelectedItem;
    handle?: string;
    featuredImage?: {
        url: string;
        altText?: string;
    };
    variants: SelectedItem[];
    originalTotalVariants: number;
}

export interface ProductPreviewGroup {
    id: string;
    title: string;
    handle?: string;
    featuredImage?: string;
    product?: {
        id: string;
        title: string;
        handle: string;
        featuredImage?: string;
    };
    variants?: Array<{
        id: string;
        title: string;
        handle: string;
        featuredImage?: string;
    }>;
    originalTotalVariants?: number;
}

/**
 * Bundle action
 */
export interface BundleAction {
    key: string;
    icon: IconSource;
    tooltip: string;
    tone?: "success" | "critical";
    disabled?: boolean;
}

/*
 * Bundle status badge types
 */
export interface BundleStatusBadge {
    text: string;
    tone: Tone;
    children?: string;
}

export interface BundleStatusBadgeNew {
    text: string;
    tone: "success" | "warning" | "info" | "critical" | "neutral" | "caution" | "auto" | undefined;
}

/*
 * Bundle config types
 */
export type BundleConfig = {
    id: BundleType;
    label: string;
    slug: string;
    description?: string;
    features?: string[];
    icon?: any;
    badge?: { text: string; tone: "success" | "info" | "warning" | "critical" };
};

/*
 * Discount config types
 */
export interface DiscountConfig {
    label: string;
    id: DiscountType;
    slug: string;
    description: string;
    symbol: string;
    suffix: string;
    format: (
        value?: number,
        formatCurrency?: (val: number) => string,
        includeLabel?: boolean,
    ) => string;
}

export interface BundleMetrics {
    totals: {
        revenue: number;
        views: number;
        purchases: number;
        addToCarts: number;
    };
    metrics: {
        conversionRate: number;
        avgOrderValue: number;
        cartConversionRate: number;
    };
    growth: {
        revenue: number;
        conversion: number;
    };
}

export interface Toast {
    active: boolean;
    message: string;
}

export interface Pagination {
    totalItems: number;
    totalPages: number;
    currentPage: number;
    itemsPerPage: number;
}
