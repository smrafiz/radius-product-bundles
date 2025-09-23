import type {
    BundleStatus as PrismaBundleStatus,
    BundleType as PrismaBundleType,
    DiscountType as PrismaDiscountType,
} from "@prisma/client";
import { BundleFormData } from "@/lib/validation";

import { type DashboardMetrics, SelectedItem } from "@/types";

/*
 * Type aliases for Prisma enums
 */
export type BundleStatus = PrismaBundleStatus;
export type BundleType = PrismaBundleType;
export type DiscountType = PrismaDiscountType;

/*
 * Dashboard state types
 */
export interface DashboardState {
    bundles: Bundle[];
    metrics: DashboardMetrics | null;
    loading: boolean;
    error: string | null;
    toast: { active: boolean; message: string };
    setBundles: (bundles: Bundle[]) => void;
    setMetrics: (metrics: DashboardMetrics) => void;
    setLoading: (loading: boolean) => void;
    setError: (error: string | null) => void;
    showToast: (message: string) => void;
    hideToast: () => void;
}

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
 * Bundle status badge types
 */
export interface BundleStatusBadge {
    text: string;
    tone: "success" | "info" | "warning" | "critical" | "subdued";
}

/*
 * Create bundle payload types
 */
export interface CreateBundlePayload {
    name: string;
    type: PrismaBundleType;
    products: {
        productId: string;
        variantId?: string;
        quantity: number;
    }[];
    discountType: PrismaDiscountType;
    discountValue?: number;
    description?: string;
    minOrderValue?: number;
    maxDiscountAmount?: number;
    startDate?: string;
    endDate?: string;
}

/*
 * Update bundle payload types
 */
export interface UpdateBundlePayload extends Partial<CreateBundlePayload> {
    id: string;
    status?: PrismaBundleStatus;
}

/*
 * Extended bundle form data types
 */
export interface ExtendedBundleFormData extends BundleFormData {
    type: PrismaBundleType;
}

/*
 * Bundle details types
 */
export interface BundleWithDetails {
    id: string;
    shop: string;
    name: string;
    description?: string;
    type: PrismaBundleType;
    status: PrismaBundleStatus;
    mainProductId?: string;
    discountType: PrismaDiscountType;
    discountValue: number;
    minOrderValue?: number;
    maxDiscountAmount?: number;
    images: string[];
    marketingCopy?: string;
    seoTitle?: string;
    seoDescription?: string;
    views: number;
    conversions: number;
    revenue: number;
    startDate?: Date;
    endDate?: Date;
    aiOptimized: boolean;
    aiScore?: number;
    createdAt: Date;
    updatedAt: Date;

    // Computed
    conversionRate: number;
    productCount: number;
}
