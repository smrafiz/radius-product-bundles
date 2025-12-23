/*
 * Bundle getters
 */

import {
    BUNDLE_STATUSES,
    BundleConfig,
    BundleConfiguration,
    BundleStatus,
    BundleStatusBadge,
    BundleStatusBadgeNew,
    BundleType,
    CREATE_STATUSES,
    DISCOUNT_TYPES,
    DiscountConfig,
    DiscountType,
    DisplaySettings,
    EDIT_STATUSES,
    ExtendedBundleFormData,
} from "@/features/bundles";
import { BUNDLE_TYPES } from "@/features/bundles/constants";
import { Bundle, BundleProduct } from "@/prisma/generated/client";

/*
 * Bundle status badge
 */
export const getBundleStatusBadge = (
    status: string | BundleStatusBadge,
): BundleStatusBadgeNew => {
    const capitalizeWords = (str: string) =>
        str.replace(/\b\w/g, (char) => char.toUpperCase());

    const config = BUNDLE_STATUSES[status as BundleStatus] ?? {
        text: capitalizeWords(String(status)),
        tone: "neutral",
    };

    return {
        text: config.text,
        tone: config.tone,
    };
};

/**
 * Get bundle configuration properties
 */
export const getBundleProperty = <
    T extends keyof Pick<BundleConfig, "label" | "slug">,
>(
    type: BundleType,
    property: T,
): BundleConfig[T] | null => {
    const config = BUNDLE_TYPES[type];
    return config?.[property] ?? null;
};

/**
 * Get discount configuration properties
 */
export const getDiscountProperty = <
    T extends keyof Pick<
        DiscountConfig,
        "label" | "slug" | "description" | "symbol" | "suffix" | "format"
    >,
>(
    type: DiscountType,
    property: T,
): DiscountConfig[T] | null => {
    const config = DISCOUNT_TYPES[type];
    return config?.[property] ?? null;
};

/**
 * Extract unique product IDs from bundles
 */
export const extractProductIds = (
    bundles: (Bundle & { bundleProducts: BundleProduct[] })[],
): string[] => {
    return Array.from(
        new Set(
            bundles.flatMap((bundle) =>
                bundle.bundleProducts.map((bp) => bp.productId),
            ),
        ),
    );
};

/**
 * Map bundle type slug to ID
 */
export const bundleTypeMap = Object.values(BUNDLE_TYPES).reduce(
    (acc, c) => {
        acc[c.slug] = c.id;
        return acc;
    },
    {} as Record<string, BundleType>,
);

export const initialDisplaySettings: DisplaySettings = {
    layout: "GRID",
    theme: "STORE_DEFAULT",
    title: "Bundle Offers",
    cartButtonText: "Add bundle to cart",
    // colorTheme: "brand",
    showPrices: true,
    showSavings: true,
    enableHyperLink: false,
    widget: {
        showOnMobile: true,
    },
    style: {
        buttonBgColor: "#303030",
        buttonTextColor: "#ffffff",
        buttonRadius: 8,
        buttonStyleEnabled: true,
        productBgColor: "#f7f7f7",
        productTextColor: "#303030",
        productStarColor: "#ffce07",
        productBorderEnabled: true,
        productBorderColor: "#e3e3e3",
        productRadius: 12,
        productAlign: 'row',
        productFontSize: 14,
        boxBgColor: "#ffffff",
        boxTextColor: "#303030",
        boxBorderEnabled: true,
        boxBorderColor: "#e3e3e3",
        boxRadius: 12,
        imageRadius: 6,
        imageBorderEnabled: true,
        imageBorderColor:"#e3e3e3",
    },
};

export const initialBundleData: Partial<ExtendedBundleFormData> = {
    name: "",
    type: undefined as BundleType | undefined,
    status: "DRAFT" as BundleStatus,
    products: [],
    discountType: undefined as DiscountType | undefined,
    discountValue: undefined,
    description: "",
    minOrderValue: undefined,
    maxDiscountAmount: undefined,
    startDate: undefined,
    endDate: undefined,
    createProduct: false,
    productTitle: "",
    productDescription: "",
    mainProductId: undefined,
    mainVariantId: undefined,
};

export const initialConfiguration: BundleConfiguration = {
    discountApplication: "bundle",
};

/**
 * Get available statuses based on mode
 */
export function getAvailableStatuses(mode: "create" | "edit"): BundleStatus[] {
    return mode === "create" ? CREATE_STATUSES : EDIT_STATUSES;
}

/**
 * Maps bundle status to appropriate Shopify product status.
 */
export function getShopifyProductStatus(
    bundleStatus: BundleStatus,
): "ACTIVE" | "DRAFT" | "ARCHIVED" {
    switch (bundleStatus) {
        case "ACTIVE":
            return "ACTIVE";
        case "ARCHIVED":
            return "ARCHIVED";
        case "DRAFT":
        case "SCHEDULED":
        case "PAUSED":
        default:
            return "DRAFT";
    }
}
