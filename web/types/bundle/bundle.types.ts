import type {
    BundleStatus as PrismaBundleStatus,
    BundleType as PrismaBundleType,
    DiscountType as PrismaDiscountType,
} from "@prisma/client";
import { SelectedItem } from "@/types";
import { BundleFormData } from "@/lib/validation";

// ----- Prisma passthrough types -----
export type BundleStatus = PrismaBundleStatus;
export type BundleType = PrismaBundleType;
export type DiscountType = PrismaDiscountType;

// ----- Core bundle types -----
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

export type BundleConfig = {
    id: BundleType;
    label: string;
    slug: string;
    description?: string;
    features?: string[];
    icon?: any;
    badge?: { text: string; tone: "success" | "info" | "warning" | "critical" };
};

export interface BundleStatusBadge {
    status: "success" | "info" | "warning" | "critical";
    children: string;
}

export interface CreateBundlePayload {
    name: string;
    type: PrismaBundleType;
    products: {
        productId: string;
        variantId: string;
        quantity: number;
    }[];
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

    // Computed
    conversionRate: number;
    productCount: number;
}

// ---- BundleState for Zustand ----
export interface ProductGroup {
    product: SelectedItem;
    variants: SelectedItem[];
    originalTotalVariants: number;
}

export interface DisplaySettings {
    layout: "horizontal" | "vertical" | "grid";
    position: "above_cart" | "below_cart" | "description" | "custom";
    title: string;
    colorTheme: "brand" | "success" | "warning" | "critical";
    showPrices: boolean;
    showSavings: boolean;
    enableQuickSwap: boolean;
}

export interface BundleConfiguration {
    discountApplication: "bundle" | "products" | "shipping";
}

export interface BundleState {
    totalSteps: number;
    currentStep: number;
    bundleData: Partial<BundleFormData>;
    selectedItems: SelectedItem[];
    displaySettings: DisplaySettings;
    configuration: BundleConfiguration;
    isLoading: boolean;
    isSaving: boolean;
    validationAttempted: boolean;

    // Step management
    setStep: (step: number) => void;
    setValidationAttempted: (attempted: boolean) => void;
    nextStep: () => void;
    prevStep: () => void;
    goToNextStep: () => void;
    canGoNext: () => boolean;
    canGoPrevious: () => boolean;

    // Bundle data actions
    setBundleData: (data: Partial<CreateBundlePayload>) => void;
    updateBundleField: <K extends keyof CreateBundlePayload>(
        key: K,
        value: CreateBundlePayload[K]
    ) => void;

    // Selected items actions
    setSelectedItems: (items: SelectedItem[]) => void;
    addSelectedItems: (items: SelectedItem[]) => void;
    removeSelectedItem: (itemId: string) => void;
    removeProductAndAllVariants: (productId: string) => void;
    updateSelectedItemQuantity: (itemId: string, quantity: number) => void;
    updateProductVariants: (
        productId: string,
        variants: SelectedItem[],
        position?: number
    ) => void;
    reorderItems: (activeId: string, overId: string) => void;

    // Computed values
    getGroupedItems: () => ProductGroup[];
    getTotalProducts: () => number;
    getTotalItems: () => number;
    getVariantInfo: (
        productId: string
    ) => { selectedCount: number; originalTotal: number };

    // Display settings
    updateDisplaySettings: <K extends keyof DisplaySettings>(
        key: K,
        value: DisplaySettings[K]
    ) => void;

    // Configuration
    updateConfiguration: <K extends keyof BundleConfiguration>(
        key: K,
        value: BundleConfiguration[K]
    ) => void;

    // Loading states
    setLoading: (loading: boolean) => void;
    setSaving: (saving: boolean) => void;

    // Reset
    resetBundle: () => void;
}