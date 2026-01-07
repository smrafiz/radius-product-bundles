/*
 * All Bundle types
 */

import type {
    BundleStatus as PrismaBundleStatus,
    BundleType as PrismaBundleType,
    DiscountType as PrismaDiscountType,
    Prisma,
} from "@/prisma/generated/client";
import { z } from "zod";
import { SerializableFile } from "@/shared";
import { bundleSchema } from "@/features/bundles";
import { Tone } from "@shopify/polaris/build/ts/src/components/Badge";

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
    role: "INCLUDED" | "OPTIONAL";
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
    discountPercent?: number | null;
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

/*
 * Bundle status badge types
 */
export interface BundleStatusBadge {
    text: string;
    tone: Tone;
    children?: string;
}

export interface BundleStatusBadgeNew {
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
    id?: string;
    type: PrismaBundleType;
    status?: PrismaBundleStatus;
    createProduct?: boolean;
    productTitle?: string;
    productDescription?: string;
    mainProductId?: string;
    mainVariantId?: string;
    discountApplication?: "bundle" | "products";
    discountedProductIds?: string[];
    freeShipping?: boolean;
    displaySettings?: DisplaySettings;
}

export interface DisplaySettings {
    layout: "GRID" | "CAROUSEL" | "LIST" | "COMPACT";
    theme: "LIGHT" | "DARK" | "STORE_DEFAULT" | "CUSTOM";
    title: string;
    cartButtonText: string;
    // colorTheme: "brand" | "success" | "warning" | "critical";
    showImages: boolean;
    showSavingsBadge: boolean;
    showPrices: boolean;
    showComparePrice: boolean;
    showSavings: boolean;
    showFreeShipping: boolean;
    enableHyperLink: boolean;
    style?: {
        // Add to Cart button
        buttonBgColor?: string;
        buttonTextColor?: string;
        buttonRadius?: number;
        buttonStyleEnabled?: boolean;
        // Product
        productBgColor?: string;
        productTextColor?: string;
        productStarColor?: string;
        productBorderEnabled?: boolean;
        productBorderColor?: string;
        productRadius?: number;
        productAlign?: "row" | "row-reverse";
        productFontSize?: number;
        // Box
        boxBgColor?: string;
        boxTextColor?: string;
        boxBorderEnabled?: boolean;
        boxBorderColor?: string;
        boxRadius?: number;
        boxBorderWidth?: number;
        //image
        imageBorderEnabled?: boolean;
        imageRadius?: number;
        imageBorderColor?: string;
        imageWidth?: number;
        //additional
        titleFontSize?: number;
        titleAlignment?: "left" | "center" | "right";
    };
    widget?: {
        showOnMobile: boolean;
    };
}

export interface BundleConfiguration {
    discountApplication: "bundle" | "products" | "shipping";
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


export interface BundlePriorityInfo {
    id: string;
    title?: string;
    description?: string;
}