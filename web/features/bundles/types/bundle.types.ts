/*
 * All Bundle types
 */

import type {
    BundleStatus as PrismaBundleStatus,
    BundleType as PrismaBundleType,
    DiscountType as PrismaDiscountType,
} from "@prisma/client";
import { z } from "zod";
import { Prisma } from "@prisma/client";
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
    settings: {
        layout: "GRID" | "CAROUSEL" | "LIST" | "COMPACT" | "FLOATING";
        theme: "LIGHT" | "DARK" | "STORE_DEFAULT" | "CUSTOM";
        position:
            | "PRODUCT_PAGE_TOP"
            | "PRODUCT_PAGE_BOTTOM"
            | "ABOVE_ADD_TO_CART"
            | "BELOW_ADD_TO_CART"
            | "SIDEBAR"
            | "FLOATING"
            | "POPUP";
        showPrices: boolean;
        showSavings: boolean;
        showProductImages: boolean;
        enableQuickAdd: boolean;
        style?: {
            primaryColor?: string;
            font?: string;
            borderRadius?: string;
            buttonStyle?: string;
        };
        widget?: {
            floating: boolean;
            autoHide: boolean;
            showOnMobile: boolean;
        };
    };
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
    createProduct?: boolean;
    productTitle?: string;
    productDescription?: string;
    mainProductId?: string;
    mainVariantId?: string;
}

export interface DisplaySettings {
    layout: "horizontal" | "vertical" | "grid";
    position: "above_cart" | "below_cart" | "description" | "custom";
    title: string;
    cartTitle: string;
    colorTheme: "brand" | "success" | "warning" | "critical";
    showPrices: boolean;
    showSavings: boolean;
    enableQuickSwap: boolean;
}

export interface BundleConfiguration {
    discountApplication: "bundle" | "products" | "shipping";
}

/*
 * Bundle media grid types
 */
export interface MediaGridProps {
    mediaFiles: File[];
    existingMedia: { id: string; url: string; alt?: string }[];
    selectedProductMediaUrls: string[];
    hoveredIndex: number | null;
    isUploading: boolean;
    onHoverStart: (index: number) => void;
    onHoverEnd: () => void;
    onRemoveNew: (index: number) => void;
    onRemoveExisting: (id: string) => void;
    onRemoveProductMedia: (url: string) => void;
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

export interface CreateBundleProductInput {
    bundleName: string;
    bundleDescription?: string;
    bundleType?: string;
    mediaFiles?: SerializableFile[];
    bundlePrice?: number;
    originalPrice?: number;
}

export interface UpdateProductInput {
    productId: string;
    variantId?: string;
    title?: string;
    description?: string;
    mediaFiles?: SerializableFile[];
    bundlePrice?: number;
    originalPrice?: number;
}

export interface ExistingMedia {
    id: string;
    url: string;
    alt?: string;
}
