/*
 * Bundle transformers types
 */

import { BundleStatus, BundleType, DiscountType } from "@/features/bundles";

/*
 * Bundle transformers
 */
export interface TransformedProduct {
    id: string;
    title: string;
    featuredImage?: string;
    handle: string;
    selectedVariant: TransformedVariant | null;
    quantity: number;
    role: string;
    displayOrder: number;
}

/*
 * Bundle variant transformer
 */
export interface TransformedVariant {
    id: string;
    title: string;
    price: number;
    compareAtPrice: number;
}

/*
 * Bundle transformer
 */
export interface TransformedBundleBase {
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
    updatedAt?: string;
    discountType: DiscountType;
    discountValue: number;
    products: TransformedProduct[];
}

/*
 * Bundle transformer with description
 */
export interface TransformedBundle extends TransformedBundleBase {
    description: string | null;
    minOrderValue: number | null;
    maxDiscountAmount: number | null;
    startDate: string | null;
    endDate: string | null;
}

/*
 * Bundle listing transformer
 */
export type TransformedBundleListing = TransformedBundleBase[];
