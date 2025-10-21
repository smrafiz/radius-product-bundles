import { Prisma } from "@prisma/client";
import { BundleStatus, BundleType, DiscountType } from "@/features/bundles";

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
    marketingCopy?: string | null;
    seoTitle?: string | null;
    seoDescription?: string | null;
    images?: string[];
    startDate?: Date | null;
    endDate?: Date | null;
}

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
}

export interface FindByShopOptions {
    search?: string;
    status?: BundleStatus[];
    type?: BundleType[];
    limit?: number;
    offset?: number;
    orderBy?: string;
    orderDirection?: "asc" | "desc";
}

export interface FindByShopFilters {
    search?: string;
    status?: BundleStatus[];
    type?: BundleType[];
}

export interface BundleProductGroupCreateInput {
    name: string;
    description?: string | null;
    minSelection?: number | null;
    maxSelection?: number | null;
    displayOrder?: number;
}

export interface BundleOwnershipCheck {
    id: string;
    name: string;
    shop: string;
}

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