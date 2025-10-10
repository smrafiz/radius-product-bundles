import type {
    BundleStatus as PrismaBundleStatus,
    BundleType as PrismaBundleType,
    DiscountType as PrismaDiscountType,
    Bundle as PrismaBundle,
} from "@prisma/client";

// Re-export Prisma enums
export type BundleStatus = PrismaBundleStatus;
export type BundleType = PrismaBundleType;
export type DiscountType = PrismaDiscountType;

/**
 * Bundle for list display
 */
export interface BundleListItem {
    id: string;
    name: string;
    type: BundleType;
    status: BundleStatus;
    discountType: DiscountType;
    discountValue: number;
    views: number;
    conversions: number;
    revenue: number;
    conversionRate: number;
    productCount: number;
    createdAt: string;
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
    featuredImage?: string;
    variants: SelectedItem[];
    originalTotalVariants: number;
}
