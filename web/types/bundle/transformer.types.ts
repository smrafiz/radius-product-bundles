import { BundleStatus, BundleType, DiscountType } from "@/types";

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

export interface TransformedVariant {
    id: string;
    title: string;
    price: number;
    compareAtPrice: number;
}

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

export interface TransformedBundle extends TransformedBundleBase {
    description: string | null;
    minOrderValue: number | null;
    maxDiscountAmount: number | null;
    startDate: string | null;
    endDate: string | null;
}

export type TransformedBundleListing = TransformedBundleBase[];