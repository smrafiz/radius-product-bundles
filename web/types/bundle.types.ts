import type {
    BundleStatus as PrismaBundleStatus,
    BundleType as PrismaBundleType,
    DiscountType as PrismaDiscountType
} from "@prisma/client";
import type { SelectedItem } from "@/types/productSelection.type";

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

export type BundleStatus = PrismaBundleStatus;
export type BundleType = PrismaBundleType;
export type DiscountType = PrismaDiscountType;

export interface BundleStatusBadge {
    status: 'success' | 'info' | 'warning' | 'critical';
    children: string;
}

export interface CreateBundlePayload {
    name: string;
    type: PrismaBundleType;
    products: string[];
    discountType?: PrismaDiscountType;
    discountValue?: number;
    description?: string;
    minOrderValue?: number;
    maxDiscountAmount?: number;
    startDate?: string;
    endDate?: string;
}

export interface UpdateBundlePayload extends Partial<CreateBundlePayload> {
    id: string;
    status?: PrismaBundleStatus;
}

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

    // Computed fields
    conversionRate: number;
    productCount: number;
}

export interface BundleState {
    currentStep: number;
    bundleData: Partial<CreateBundlePayload>;
    selectedItems: SelectedItem[];
    setStep: (step: number) => void;
    nextStep: () => void;
    prevStep: () => void;
    setBundleData: (data: Partial<CreateBundlePayload>) => void;
    updateBundleField: <K extends keyof CreateBundlePayload>(
        key: K,
        value: CreateBundlePayload[K],
    ) => void;
    setSelectedItems: (items: SelectedItem[]) => void;
    addSelectedItems: (items: SelectedItem[]) => void;
    removeSelectedItem: (index: number) => void;
    updateSelectedItemQuantity: (index: number, quantity: number) => void;
    resetBundle: () => void;
}