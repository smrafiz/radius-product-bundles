/*
 * Repository types
 */

import { Prisma } from "@/prisma/generated/client";
import { BundleStatus, BundleType, DiscountType } from "@/features/bundles";

/*
 * Bundle repository types
 */
export interface CreateBundleInput {
    shop: string;
    name: string;
    description?: string | null;
    products?: Array<{
        productId: string;
        variantId: string;
        quantity: number;
    }>;
    type: BundleType;
    status?: BundleStatus;
    mainProductId?: string | null;
    mainVariantId?: string | null;
    buyQuantity?: number | null;
    getQuantity?: number | null;
    minimumItems?: number | null;
    maximumItems?: number | null;
    discountType: DiscountType;
    discountValue: number;
    minOrderValue?: number | null;
    maxDiscountAmount?: number | null;
    volumeTiers?: Prisma.JsonValue;
    allowMixAndMatch?: boolean;
    mixAndMatchPrice?: number | null;
    discountApplication?: string | null;
    discountedProductIds?: string[];
    freeShipping?: boolean;
    marketingCopy?: string | null;
    seoTitle?: string | null;
    seoDescription?: string | null;
    images?: string[];
    startDate?: Date | null;
    endDate?: Date | null;
    productGroups?: Array<{
        name: string;
        description?: string | null;
        minSelection?: number | null;
        maxSelection?: number | null;
        displayOrder?: number;
    }>;
    settings?: Prisma.JsonValue;
}

/*
 * Bundle update input
 */
export interface UpdateBundleInput {
    name?: string;
    description?: string | null;
    type?: BundleType;
    status?: BundleStatus;
    discountType?: DiscountType;
    discountValue?: number;
    minOrderValue?: number | null;
    maxDiscountAmount?: number | null;
    startDate?: Date | null;
    endDate?: Date | null;
    discountApplication?: string;
    discountedProductIds?: string[];
    freeShipping?: boolean;
    mainProductId?: string | null;
    mainVariantId?: string | null;
}

/*
 * Bundle update input with relations
 */
export interface UpdateBundleInputWithRelations {
    bundleId: string;
    shop: string;
    name: string;
    description?: string | null;
    type: BundleType;
    status?: BundleStatus;
    mainProductId?: string | null;
    mainVariantId?: string | null;
    buyQuantity?: number | null;
    getQuantity?: number | null;
    minimumItems?: number | null;
    maximumItems?: number | null;
    discountType: DiscountType;
    discountValue: number;
    minOrderValue?: number | null;
    maxDiscountAmount?: number | null;
    volumeTiers?: any;
    allowMixAndMatch?: boolean | null;
    mixAndMatchPrice?: number | null;
    discountApplication?: string;
    discountedProductIds?: string[];
    freeShipping?: boolean;
    marketingCopy?: string | null;
    seoTitle?: string | null;
    seoDescription?: string | null;
    images?: any;
    startDate?: Date | null;
    endDate?: Date | null;
    products?: Array<{
        productId: string;
        variantId?: string | null;
        quantity: number;
        role?: string;
        displayOrder?: number;
    }>;
    productGroups?: Array<{
        name: string;
        description?: string | null;
        minSelection?: number;
        maxSelection?: number | null;
        displayOrder?: number;
        products?: Array<{
            productId: string;
            variantId?: string | null;
            quantity: number;
        }>;
    }>;
    settings?: {
        showBadge?: boolean;
        badgeText?: string;
        badgeColor?: string;
        enableInventoryTracking?: boolean;
        allowBackorders?: boolean;
        [key: string]: any;
    } | null;
}

/*
 * Bundle product input
 */
export interface BundleProductInput {
    productId: string;
    variantId?: string | null;
    quantity: number;
    role?: "INCLUDED" | "OPTIONAL";
    groupId?: string | null;
    customPrice?: number | null;
}

/*
 * Find by shop options
 */
export interface FindByShopOptions {
    search?: string;
    status?: BundleStatus[];
    type?: BundleType[];
    limit?: number;
    offset?: number;
    orderBy?: string;
    orderDirection?: "asc" | "desc";
}

/*
 * Find by shop filters
 */
export interface FindByShopFilters {
    search?: string;
    status?: BundleStatus[];
    type?: BundleType[];
}

/*
 * Bundle product group create input
 */
export interface BundleProductGroupCreateInput {
    name: string;
    description?: string | null;
    minSelection?: number | null;
    maxSelection?: number | null;
    displayOrder?: number;
}

/*
 * Bundle ownership check
 */
export interface BundleOwnershipCheck {
    id: string;
    name: string;
    shop: string;
}

/*
 * Bundle analytics metrics
 */
export interface AnalyticsMetrics {
    currentPeriod: {
        _sum: {
            bundleViews: number | null;
            bundlePurchases: number | null;
            bundleRevenue: number | null;
            bundleAddToCarts: number | null;
        };
    };
    previousPeriod: {
        _sum: {
            bundleViews: number | null;
            bundlePurchases: number | null;
            bundleRevenue: number | null;
        };
    };
    totalRevenueAllTime: {
        _sum: {
            bundleRevenue: number | null;
        };
    };
    totalBundles: number;
    activeBundles: number;
}

export type BundleWithSettings = Prisma.BundleGetPayload<{
    include: { settings: true };
}>;
