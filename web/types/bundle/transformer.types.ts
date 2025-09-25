export interface TransformedProduct {
    id: string;
    title: string;
    featuredImage: string | null;
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
    type: string;
    status: string;
    views: number;
    conversions: number;
    revenue: number;
    conversionRate: number;
    productCount: number;
    createdAt: string;
    updatedAt: string;
    products: TransformedProduct[];
}

export interface TransformedBundle extends TransformedBundleBase {
    description: string | null;
    discountType: string;
    discountValue: number;
    minOrderValue: number | null;
    maxDiscountAmount: number | null;
    startDate: string | null;
    endDate: string | null;
}

export type TransformedBundleListing = TransformedBundleBase[];