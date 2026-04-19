/*
 * All Bundle types
 */

import { z } from "zod";
import type {
    BundleStatus as PrismaBundleStatus,
    BundleType as PrismaBundleType,
    DiscountType as PrismaDiscountType,
    Prisma,
} from "@/prisma/generated/client";
import { DiscountApplication, PriorityType } from "@/prisma/generated/client";
export { DiscountApplication, PriorityType };
import { SerializableFile } from "@/shared";
import { bundleSchema } from "@/features/bundles";

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
    volumeTiers?: VolumeDiscountConfig;
    buyQuantity?: number;
    getQuantity?: number;

    products: Array<{
        id: string;
        title: string;
        featuredImage?: string;
        handle: string;
    }>;
    mainProduct?: { id: string; title: string; handle: string } | null;
}

/**
 * Full bundle with all details
 */
export interface BundleDetail extends Prisma.BundleGetPayload<{}> {
    conversionRate: number;
    productCount: number;
    products: SelectedItem[];
    settings: DisplaySettings;
    productGroups?: ProductGroup[];
}

/**
 * Bundle creation/update payload
 */
export type BundleFormData = z.infer<typeof bundleSchema>;

/**
 * Bundle product
 */
export interface BundleProduct {
    productId: string;
    variantId?: string;
    quantity: number;
    role: "TRIGGER" | "REWARD" | "INCLUDED" | "OPTIONAL" | "GROUP_OPTION";
}

/**
 * Product selection item
 */
export interface SelectedItem {
    id: string;
    productId: string;
    variantId?: string;
    variantIds: string[];
    title: string;
    url: string;
    type: "product" | "variant";
    quantity: number;
    price: string;
    compareAtPrice?: string | null;
    image?: string;
    handle: string;
    vendor: string;
    productType: string;
    sku?: string;
    totalVariants: number;
    inventoryQuantity?: number;
    availableForSale?: boolean;
    displayOrder?: number;
    role?: "TRIGGER" | "REWARD" | "INCLUDED" | "OPTIONAL" | "GROUP_OPTION";
    groupId?: string;
    customPrice?: number | null;
    isRequired?: boolean;
    selectedVariant?: {
        id: string;
        title: string;
        price: string;
        compareAtPrice?: string | null;
        availableForSale: boolean;
        inventoryQuantity: number;
        productId: string;
    };
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
    quantity: number;
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
    icon: "edit" | "delete" | "duplicate" | "view";
    tooltip: string;
    tone?: "neutral" | "critical" | undefined;
    disabled?: boolean;
}

export interface BundleStatusBadge {
    text: string;
    desc?: string;
    tone:
        | "success"
        | "warning"
        | "info"
        | "critical"
        | "neutral"
        | "caution"
        | "auto"
        | undefined;
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
    bundleImage?: string;
    modalImage?: string;
    badge?: { text: string; tone: "success" | "info" | "warning" | "critical" };
    comingSoon?: boolean | undefined;
    hidden?: boolean;
    proRequired?: boolean;
    namePatterns: readonly string[];
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

export interface BundleHelpItem {
    title: string;
    bundles: string;
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
 * Extended bundle form data types
 */
export interface ExtendedBundleFormData extends BundleFormData {
    id?: string;
    type: PrismaBundleType;
    status?: PrismaBundleStatus;
    createProduct?: boolean;
    mainProductId?: string;
    mainProductHandle?: string;
    mainVariantId?: string;
    discountApplication?: DiscountApplication;
    discountedProductIds?: string[];
    freeShipping?: boolean;
    priority?: number;
    usesPerOrderLimit?: number | null;
    sameProductMode?: boolean;
    openEnded?: boolean;
    displaySettings?: DisplaySettings;
}

export type FixedBundleLayout = "GRID" | "CAROUSEL" | "LIST" | "COMPACT";
export type BogoLayout =
    | "CLASSIC_CARD"
    | "COMPACT_GRID"
    | "MINIMALIST"
    | "SLEEK"
    | "CHECKLIST"
    | "SPLIT_DEAL";
export type VolumeLayout =
    | "VOLUME_TIER_LIST"
    | "VOLUME_PRICING_CARDS"
    | "VOLUME_SLIDER"
    | "VOLUME_CALCULATOR";
export type BundleLayoutType = FixedBundleLayout | BogoLayout | VolumeLayout;

/*
 * Volume Discount types
 */
export type VolumeBadgeStyle = "none" | "popular" | "best-value" | "custom";

export interface VolumeTierBadge {
    style: VolumeBadgeStyle;
    text?: string;
}

export interface VolumeTier {
    id?: string;
    minQuantity: number;
    discount: number;
    title: string;
    subtitle?: string;
    badge?: VolumeTierBadge;
    isDefault?: boolean;
}

export interface VolumeDiscountConfig {
    discountType: "PERCENTAGE" | "FIXED_AMOUNT";
    openEnded: boolean;
    tiers: VolumeTier[];
}

export interface DisplaySettings {
    layout: BundleLayoutType;
    title: string;
    subtitle: string;
    cartButtonText: string;
    showImages: boolean;
    showSavingsBadge: boolean;
    showPrices: boolean;
    showComparePrices: boolean;
    showQuantity: boolean;
    showSavings: boolean;
    showFreeShipping: boolean;
    enableHyperLink: boolean;
}

export interface BundleConfiguration {
    discountApplication: DiscountApplication;
}

/*
 * Bundle media grid types
 */
export interface MediaGridProps {
    existingMedia: { id: string; url: string; alt?: string }[];
    pendingMedia: PendingMediaItem[];
    hoveredIndex: number | null;
    isUploading: boolean;
    onHoverStart: (index: number) => void;
    onHoverEnd: () => void;
    onRemoveExisting: (id: string) => void;
    onRemovePending: (id: string) => void;
    onUpload: (files: File[]) => void;
}

/**
 * Individual media grid item with hover effects
 */
export interface MediaGridItemProps {
    src: string;
    alt: string;
    index: number;
    isHovered: boolean;
    isFirst: boolean;
    onHoverStart: (index: number) => void;
    onHoverEnd: () => void;
    onRemove: () => void;
}

/**
 * Input for creating a Shopify product for a bundle
 */
export interface CreateBundleProductInput {
    bundleName: string;
    bundleDescription?: string;
    bundleType?: string;
    bundleStatus?: PrismaBundleStatus;
    mediaFiles?: SerializableFile[];
    bundlePrice?: number;
    originalPrice?: number;
}

/**
 * Input for updating a Shopify bundle product
 */
export interface UpdateProductInput {
    productId: string;
    variantId?: string;
    title?: string;
    description?: string;
    status?: PrismaBundleStatus;
    mediaFiles?: SerializableFile[];
    bundlePrice?: number;
    originalPrice?: number;
}

export interface ExistingMedia {
    id: string;
    url: string;
    alt?: string;
}

/**
 * Pending media item - can be a file to upload or URL to attach
 */
export type PendingMediaItem =
    | { type: "file"; file: File; id: string }
    | { type: "url"; url: string; id: string };
